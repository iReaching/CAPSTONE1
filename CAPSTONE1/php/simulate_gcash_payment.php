<?php
include 'db_connect.php';
include 'log_action.php';
include 'gcash_config.php';
include 'cors.php';
header("Content-Type: application/json");

$config = gcash_sandbox_config();
if ($config['mode_is_sandbox']) {
  echo json_encode([
    'success' => false,
    'message' => 'Xendit sandbox mode is active. Use the hosted checkout instead of the mock simulator.'
  ]);
  exit;
}

$due_id = $_POST['due_id'] ?? '';
$user_id = $_POST['user_id'] ?? '';
$reference = trim($_POST['reference'] ?? '');
$sender_name = trim($_POST['sender_name'] ?? '');
$sender_mobile = trim($_POST['sender_mobile'] ?? '');
$amount = $_POST['amount'] ?? '';

if (!$due_id || !$user_id || !$reference) {
  echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
  exit;
}

$stmt = $conn->prepare("SELECT id, user_id, is_paid FROM monthly_dues WHERE id = ?");
$stmt->bind_param("i", $due_id);
$stmt->execute();
$due = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$due) {
  echo json_encode(['success' => false, 'message' => 'Due not found.']);
  $conn->close();
  exit;
}

if ($due['user_id'] !== $user_id) {
  echo json_encode(['success' => false, 'message' => 'You can only pay your own dues.']);
  $conn->close();
  exit;
}

if ((int)$due['is_paid'] === 1) {
  echo json_encode(['success' => false, 'message' => 'This due is already paid.']);
  $conn->close();
  exit;
}

$conn->begin_transaction();
try {
  $update = $conn->prepare("UPDATE monthly_dues SET payment_requested = 1, gcash_reference = ?, gcash_sender_name = ?, gcash_sender_mobile = ?, gcash_amount = ?, payment_proof_path = NULL WHERE id = ?");
  $amt = $amount !== '' ? (float)$amount : null;
  $update->bind_param("sssdi", $reference, $sender_name, $sender_mobile, $amt, $due_id);
  if (!$update->execute()) {
    throw new Exception($update->error ?: 'Failed to update due');
  }
  $update->close();

  logAction($user_id, 'update', "Submitted sandbox payment for due ID {$due_id}", basename(__FILE__));
  $conn->commit();
  echo json_encode(['success' => true, 'message' => 'Sandbox payment recorded. Awaiting admin confirmation.']);
} catch (Exception $e) {
  $conn->rollback();
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
