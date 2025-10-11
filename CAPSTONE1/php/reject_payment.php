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

$sel = $conn->prepare("SELECT gcash_reference, user_id FROM monthly_dues WHERE id = ?");
$sel->bind_param('i', $id);
$sel->execute();
$info = $sel->get_result()->fetch_assoc();
$sel->close();
$gcash_reference = $info['gcash_reference'] ?? null;
$user_for_due = $info['user_id'] ?? null;

$stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 0, payment_proof_path = NULL WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  $gcashConfig = gcash_sandbox_config();
  if ($gcashConfig['mode_is_sandbox'] && $gcash_reference) {
    gcash_ensure_transactions_table($conn);
    $lookup = $conn->prepare("SELECT id FROM gcash_transactions WHERE reference = ? ORDER BY id DESC LIMIT 1");
    $lookup->bind_param('s', $gcash_reference);
    $lookup->execute();
    $txnRow = $lookup->get_result()->fetch_assoc();
    $lookup->close();
    if ($txnRow) {
      gcash_update_transaction($conn, (int)$txnRow['id'], 'rejected_admin', [
        'manual_reject' => true,
        'admin_id' => $admin_id,
        'reference' => $gcash_reference,
      ]);
    }
  }
  logAction($admin_id, 'update', "Rejected payment request for due ID $id", basename(__FILE__));
  echo json_encode(["success" => true, "message" => "Payment request rejected"]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>

