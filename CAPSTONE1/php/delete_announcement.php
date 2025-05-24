<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';
$user_id = $_POST['user_id'] ?? '';

if (!$id || !$user_id) {
  echo json_encode(["success" => false, "message" => "Missing ID or user"]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM announcements WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  logAction($user_id, 'delete', "Deleted announcement ID $id", basename(__FILE__));
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
