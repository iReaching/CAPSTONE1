<?php
session_start();
require 'db_connect.php';

// Allow cross-origin requests for local React dev
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

// Upload helper for ID photo
function uploadIDPhoto($fileKey) {
  $uploadDir = dirname(__DIR__) . '/uploads/id_photos/';
  $relativePath = 'uploads/id_photos/';

  if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

  if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
      $filename = uniqid("id_") . '_' . basename($_FILES[$fileKey]['name']);
      $targetPath = $uploadDir . $filename;
      if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $targetPath)) {
          return $relativePath . $filename; // this is what gets stored in DB
      }
  }
  return null;
}


// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $entry_type = $_POST['entry_type'] ?? '';
    $vehicle_plate = $_POST['vehicle_plate'] ?? '';
    $reason = $_POST['reason'] ?? '';
    $expected = isset($_POST['expected']) && $_POST['expected'] === 'true' ? 1 : 0;
    $expected_time = $_POST['expected_time'] ?? null;
    $requested_by = $_SESSION['user_id'] ?? '';  // fallback to blank if not logged in
    $id_photo_path = uploadIDPhoto('id_photo');

    $sql = "INSERT INTO entry_log (name, entry_type, vehicle_plate, reason, expected, expected_time, requested_by, id_photo_path, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssssisss", $name, $entry_type, $vehicle_plate, $reason, $expected, $expected_time, $requested_by, $id_photo_path);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Entry logged successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }
}
?>
