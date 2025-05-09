<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';

if (!$id) {
  echo json_encode(["success" => false, "message" => "Missing amenity ID."]);
  exit;
}

$stmt = $conn->prepare("DELETE FROM amenities WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Amenity deleted successfully."]);
} else {
  echo json_encode(["success" => false, "message" => "Failed to delete amenity."]);
}

$stmt->close();
$conn->close();
?>
