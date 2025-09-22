<?php
include 'cors.php';
header("Content-Type: application/json");

include '../PHP/db_connect.php';
include 'log_action.php';

$id = $_POST['id'];

$sql = "UPDATE maintenance_reports SET status = 'resolved' WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  logAction($_POST['user_id'] ?? 'unknown', 'update', "Marked report ID $id as resolved", 'update_profile_status.php');
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "error" => $stmt->error]);
}
?>
