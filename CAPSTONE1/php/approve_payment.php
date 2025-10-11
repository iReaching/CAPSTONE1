<?php
include 'db_connect.php';
include 'log_action.php';
include 'check_auth.php';
include 'cors.php';
require_once __DIR__ . '/gcash_client.php';
header("Content-Type: application/json");

require_role(['admin']);
$admin_id = current_user_id();

$id = $_POST['id'] ?? '';

if (!$id) {
  echo json_encode(["success" => false, "message" => "Missing due ID"]);
  exit;
}

// Fetch amounts for ledger
$sel = $conn->prepare("SELECT user_id, amount_due, gcash_reference, COALESCE(gcash_amount, amount_due) AS requested_amount FROM monthly_dues WHERE id = ?");
$sel->bind_param('i', $id); $sel->execute(); $res = $sel->get_result(); $row = $res->fetch_assoc(); $sel->close();
$user_for_due = $row ? $row['user_id'] : null; $requested_amount = $row ? (float)$row['requested_amount'] : 0.0;
$gcash_reference = $row ? $row['gcash_reference'] : null;

// Compute outstanding before approval using ledger
$paid_total = 0.0; $late_total = 0.0; $adj_total = 0.0; $amount_due = $row ? (float)$row['amount_due'] : 0.0;
if ($id) {
  $sp = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM dues_ledger WHERE due_id=? AND entry_type='payment'");
  $sp->bind_param('i', $id); $sp->execute(); $r1 = $sp->get_result()->fetch_assoc(); $paid_total = (float)$r1['s']; $sp->close();
  $sl = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM dues_ledger WHERE due_id=? AND entry_type='late_fee'");
  $sl->bind_param('i', $id); $sl->execute(); $r2 = $sl->get_result()->fetch_assoc(); $late_total = (float)$r2['s']; $sl->close();
  $sa = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM dues_ledger WHERE due_id=? AND entry_type='adjustment'");
  $sa->bind_param('i', $id); $sa->execute(); $r3 = $sa->get_result()->fetch_assoc(); $adj_total = (float)$r3['s']; $sa->close();
}
$outstanding_before = round($amount_due + $late_total + $adj_total - $paid_total, 2);
if ($outstanding_before < 0) { $outstanding_before = 0.0; }

// Amount to apply to this due
$to_apply = min(max($requested_amount, 0.0), $outstanding_before);
$overpay = max($requested_amount - $to_apply, 0.0);

// Ensure ledger table
$conn->query("CREATE TABLE IF NOT EXISTS dues_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  due_id INT NULL,
  entry_type ENUM('charge','payment','late_fee','adjustment') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id), INDEX idx_due (due_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->begin_transaction();
try {
  // Insert payment portion
  if ($user_for_due && $to_apply > 0) {
    $ins = $conn->prepare("INSERT INTO dues_ledger (user_id, due_id, entry_type, amount, note) VALUES (?,?,?,?,?)");
    $etype='payment'; $note='Payment approved';
    $ins->bind_param('sisss', $user_for_due, $id, $etype, $to_apply, $note);
    if (!$ins->execute() || $ins->affected_rows !== 1) { throw new Exception('Failed to insert payment'); }
    $ins->close();
  }

  // Overpayment credit
  if ($user_for_due && $overpay > 0) {
    $adj = $conn->prepare("INSERT INTO dues_ledger (user_id, due_id, entry_type, amount, note) VALUES (?,?,?,?,?)");
    $etype2='adjustment'; $note2='Overpayment credit'; $neg = -$overpay; $nullDue = NULL;
    $adj->bind_param('sisss', $user_for_due, $nullDue, $etype2, $neg, $note2);
    if (!$adj->execute() || $adj->affected_rows !== 1) { throw new Exception('Failed to insert overpayment credit'); }
    $adj->close();
  }

  // Set is_paid based on remaining outstanding
  $remaining = $outstanding_before - $to_apply;
  $paid_flag = ($remaining <= 0.00001) ? 1 : 0;
  $stmt = $conn->prepare("UPDATE monthly_dues SET is_paid = ?, payment_requested = 0, payment_date = CURDATE(), verified_by = ?, verified_at = NOW() WHERE id = ?");
  $stmt->bind_param("isi", $paid_flag, $admin_id, $id);
  if (!$stmt->execute()) { throw new Exception('Failed to update due'); }
  $stmt->close();

  $gcashConfig = gcash_sandbox_config();
  if ($gcashConfig['mode_is_sandbox'] && $gcash_reference) {
    gcash_ensure_transactions_table($conn);
    $lookup = $conn->prepare("SELECT id FROM gcash_transactions WHERE reference = ? ORDER BY id DESC LIMIT 1");
    $lookup->bind_param('s', $gcash_reference);
    $lookup->execute();
    $txnRow = $lookup->get_result()->fetch_assoc();
    $lookup->close();
    if ($txnRow) {
      gcash_update_transaction($conn, (int)$txnRow['id'], 'approved_manual', [
        'manual_approval' => true,
        'admin_id' => $admin_id,
        'reference' => $gcash_reference,
      ]);
    }
  }

  $conn->commit();
  logAction($admin_id, 'update', "Approved payment for due ID $id (applied=".$to_apply.", overpay=".$overpay.")", basename(__FILE__));
  echo json_encode(["success" => true, "message" => "Payment approved", "applied"=>$to_apply, "remaining"=>max($remaining,0)]);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(["success" => false, "message" => $e->getMessage()]);
}

$conn->close();
?>
