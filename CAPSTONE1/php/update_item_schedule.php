<?php
include 'cors.php';
header("Content-Type: application/json");

include 'db_connect.php';
include 'log_action.php';

$data = json_decode(file_get_contents("php://input"));
$id = $data->id;
$status = $data->status;

$stmt = $conn->prepare("UPDATE item_schedule SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {
  logAction($data->user_id ?? 'unknown', 'update', "Item schedule ID $id updated to $status", 'update_item_schedule.php');
  echo json_encode(["message" => "Item schedule updated"]);
} else {
  echo json_encode(["message" => "Update failed", "error" => $stmt->error]);
}
?>
