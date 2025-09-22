<?php
include 'cors.php';
header("Content-Type: application/json");

include '../PHP/db_connect.php';
include 'log_action.php';

$id = $_POST['id'];
$status = $_POST['status'];

$sql = "UPDATE amenity_schedule SET status = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
  logAction($_POST['user_id'] ?? 'unknown', 'update', "Amenity schedule ID $id marked as $status", 'update_amenity_status.php');
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "error" => $stmt->error]);
}
?>
