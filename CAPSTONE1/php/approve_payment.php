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

$stmt = $conn->prepare("UPDATE monthly_dues SET is_paid = 1, payment_requested = 0, payment_date = CURDATE() WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  logAction('admin', 'update', "Approved payment for due ID $id", basename(__FILE__));
  echo json_encode(["success" => true, "message" => "Payment approved"]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
