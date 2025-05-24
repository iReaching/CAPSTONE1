<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';

if (!$id) {
  echo json_encode(["success" => false, "message" => "Missing due ID"]);
  exit;
}

$stmt = $conn->prepare("UPDATE monthly_dues SET is_paid = 1, payment_date = CURDATE() WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  logAction('admin', 'update', "Marked due ID $id as paid", basename(__FILE__));
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
