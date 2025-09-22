<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';

if (!$id) {
  echo json_encode(["success" => false, "message" => "Missing due ID"]);
  exit;
}

$stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 0, payment_proof_path = NULL WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  logAction('admin', 'update', "Rejected payment request for due ID $id", basename(__FILE__));
  echo json_encode(["success" => true, "message" => "Payment request rejected"]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
