<?php
include 'db_connect.php';
include 'check_auth.php';
include 'cors.php';
header('Content-Type: application/json');

require_role(['admin']);

$due_id = isset($_POST['due_id']) ? (int)$_POST['due_id'] : 0;
if (!$due_id) { echo json_encode(['success'=>false,'message'=>'Missing due_id']); exit; }

// Fetch due and user
$st = $conn->prepare("SELECT id, user_id, amount_due FROM monthly_dues WHERE id=?");
$st->bind_param('i', $due_id); $st->execute(); $row = $st->get_result()->fetch_assoc(); $st->close();
if (!$row) { echo json_encode(['success'=>false,'message'=>'Due not found']); exit; }
$user_id = $row['user_id']; $base = (float)$row['amount_due'];

// We serialize credit application per user to avoid races
$lockName = 'apply_credit_user_' . $user_id;
$lock = $conn->query("SELECT GET_LOCK('".$conn->real_escape_string($lockName)."', 5) AS l")->fetch_assoc();
if ((int)$lock['l'] !== 1) { echo json_encode(['success'=>false,'message'=>'Busy, please retry']); exit; }

$conn->begin_transaction();

// Recompute outstanding and credit INSIDE the transaction for correctness
$sum = function($type) use ($conn, $due_id) {
  $q = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM dues_ledger WHERE due_id=? AND entry_type=? FOR UPDATE");
  $q->bind_param('is', $due_id, $type); $q->execute(); $r = $q->get_result()->fetch_assoc(); $q->close();
  return (float)$r['s'];
};
$paid = $sum('payment'); $late = $sum('late_fee'); $adj = $sum('adjustment');
$outstanding = round($base + $late + $adj - $paid, 2);
if ($outstanding <= 0) { $conn->rollback(); $conn->query("SELECT RELEASE_LOCK('".$conn->real_escape_string($lockName)."')"); echo json_encode(['success'=>false,'message'=>'Nothing outstanding']); exit; }

$balRes = $conn->query("SELECT COALESCE(SUM(CASE WHEN entry_type IN ('charge','late_fee') THEN amount WHEN entry_type='payment' THEN -amount ELSE amount END),0) AS balance FROM dues_ledger WHERE user_id='".$conn->real_escape_string($user_id)."' FOR UPDATE");
$balRow = $balRes->fetch_assoc();
$balance = (float)($balRow['balance'] ?? 0);
$available_credit = $balance < 0 ? abs($balance) : 0.0;
if ($available_credit <= 0) { $conn->rollback(); $conn->query("SELECT RELEASE_LOCK('".$conn->real_escape_string($lockName)."')"); echo json_encode(['success'=>false,'message'=>'No available credit']); exit; }

$apply = min($available_credit, $outstanding);
try {
  // Apply credit: add a due-bound payment and counterbalance with a positive adjustment (transfer)
  $ins1 = $conn->prepare("INSERT INTO dues_ledger (user_id, due_id, entry_type, amount, note) VALUES (?,?,?,?,?)");
  $etype1='payment'; $note1='Applied credit';
  $ins1->bind_param('sisss', $user_id, $due_id, $etype1, $apply, $note1);
  if (!$ins1->execute() || $ins1->affected_rows !== 1) { throw new Exception('Failed to insert payment'); }
  $ins1->close();

  $ins2 = $conn->prepare("INSERT INTO dues_ledger (user_id, due_id, entry_type, amount, note) VALUES (?,?,?,?,?)");
  $etype2='adjustment'; $note2='Credit transfer to due';
  $nullDueId = NULL;
  $ins2->bind_param('sisss', $user_id, $nullDueId, $etype2, $apply, $note2);
  if (!$ins2->execute() || $ins2->affected_rows !== 1) { throw new Exception('Failed to insert adjustment'); }
  $ins2->close();

  // Optionally mark paid if fully covered
  $remaining = $outstanding - $apply;
  if ($remaining <= 0.00001) {
    $upd = $conn->prepare("UPDATE monthly_dues SET is_paid=1, payment_requested=0, payment_date=CURDATE(), verified_by=?, verified_at=NOW() WHERE id=?");
    $admin = current_user_id();
    $upd->bind_param('si', $admin, $due_id);
    if (!$upd->execute()) { throw new Exception('Failed to update due status'); }
    $upd->close();
  }

  $conn->commit();
  $conn->query("SELECT RELEASE_LOCK('".$conn->real_escape_string($lockName)."')");
  echo json_encode(['success'=>true, 'applied'=>$apply, 'remaining'=>max($remaining,0)]);
} catch (Exception $e) {
  $conn->rollback();
  $conn->query("SELECT RELEASE_LOCK('".$conn->real_escape_string($lockName)."')");
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

$conn->close();
?>
