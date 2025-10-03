<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) { echo json_encode(['success'=>false,'message'=>'Missing id']); exit; }

$conn->begin_transaction();
try {
  $st = $conn->prepare("SELECT * FROM advance_payments WHERE id=? FOR UPDATE");
  $st->bind_param('i', $id); $st->execute(); $row = $st->get_result()->fetch_assoc(); $st->close();
  if (!$row) throw new Exception('Not found');
  if ($row['status'] !== 'pending') throw new Exception('Already processed');

  $upd = $conn->prepare("UPDATE advance_payments SET status='rejected', reviewed_by=?, reviewed_at=NOW() WHERE id=?");
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