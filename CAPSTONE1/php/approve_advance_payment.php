<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) { echo json_encode(['success'=>false,'message'=>'Missing id']); exit; }

// Ensure ledger table exists
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
  $st = $conn->prepare("SELECT * FROM advance_payments WHERE id=? FOR UPDATE");
  $st->bind_param('i', $id); $st->execute(); $row = $st->get_result()->fetch_assoc(); $st->close();
  if (!$row) throw new Exception('Not found');
  if ($row['status'] !== 'pending') throw new Exception('Already processed');

  $user_id = $row['user_id']; $amount = (float)$row['amount'];
  $note = 'Advance payment approved (adv_id='.$id.')';
  $ins = $conn->prepare("INSERT INTO dues_ledger (user_id, due_id, entry_type, amount, note) VALUES (?,?,?,?,?)");
  $etype = 'payment'; $nullDue = NULL;
  $ins->bind_param('sisss', $user_id, $nullDue, $etype, $amount, $note);
  if (!$ins->execute() || $ins->affected_rows !== 1) throw new Exception('Failed to insert ledger');
  $ins->close();

  $upd = $conn->prepare("UPDATE advance_payments SET status='approved', reviewed_by=?, reviewed_at=NOW() WHERE id=?");
  $admin = current_user_id();
  $upd->bind_param('si', $admin, $id);
  if (!$upd->execute()) throw new Exception('Failed to update status');
  $upd->close();

  $conn->commit();
  echo json_encode(['success'=>true]);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}

$conn->close();
?>