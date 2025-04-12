<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'], $data['action'])) {
  echo json_encode(["success" => false, "error" => "Missing parameters"]);
  exit;
}

$id = $data['id'];
$action = $data['action'];

if (!in_array($action, ['approved', 'rejected'])) {
  echo json_encode(["success" => false, "error" => "Invalid action"]);
  exit;
}

$stmt = $conn->prepare("UPDATE amenity_schedule SET status = ? WHERE id = ?");
$stmt->bind_param("si", $action, $id);

if ($stmt->execute()) {
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
