<?php
include 'db_connect.php';
include 'log_action.php';

include 'cors.php';
header("Content-Type: application/json");

$user_id = $_POST['user_id'] ?? '';
$amount_due = $_POST['amount_due'] ?? '';
$due_month = $_POST['due_month'] ?? '';

if (!$user_id || !$amount_due || !$due_month) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

$stmt = $conn->prepare("INSERT INTO monthly_dues (user_id, amount_due, due_month) VALUES (?, ?, ?)");
$stmt->bind_param("sds", $user_id, $amount_due, $due_month);

if ($stmt->execute()) {
  logAction($user_id, 'insert', "Added monthly due for $due_month", basename(__FILE__));
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
