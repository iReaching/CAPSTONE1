<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db_connect.php';

$user_id = $_GET['user_id'] ?? '';
$response = [
  "my_amenities" => 0,
  "my_items" => 0,
  "my_reports" => 0,
  "my_guests" => 0
];

if ($user_id) {
  $stmt = $conn->prepare("SELECT COUNT(*) FROM amenity_schedule WHERE homeowner_id = ?");
  $stmt->bind_param("s", $user_id);
  $stmt->execute();
  $stmt->bind_result($response['my_amenities']);
  $stmt->fetch();
  $stmt->close();

  $stmt = $conn->prepare("SELECT COUNT(*) FROM item_schedule WHERE homeowner_id = ?");
  $stmt->bind_param("s", $user_id);
  $stmt->execute();
  $stmt->bind_result($response['my_items']);
  $stmt->fetch();
  $stmt->close();

  $stmt = $conn->prepare("SELECT COUNT(*) FROM maintenance_reports WHERE user_id = ?");
  $stmt->bind_param("s", $user_id);
  $stmt->execute();
  $stmt->bind_result($response['my_reports']);
  $stmt->fetch();
  $stmt->close();

  $stmt = $conn->prepare("SELECT COUNT(*) FROM entry_log WHERE requested_by = ?");
  $stmt->bind_param("s", $user_id);
  $stmt->execute();
  $stmt->bind_result($response['my_guests']);
  $stmt->fetch();
  $stmt->close();
}

echo json_encode($response);
$conn->close();
?>
