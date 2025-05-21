<?php
session_start();
require 'db_connect.php';
require 'log_action.php';

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
            return $relativePath . $filename;
        }
    }
    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $vehicle_plate = $_POST['vehicle_plate'] ?? '';
    $reason = $_POST['reason'] ?? '';
    $visitor_count = isset($_POST['visitor_count']) ? (int)$_POST['visitor_count'] : 1;
    $package_details = $_POST['package_details'] ?? '';
    $homeowner_name = $_POST['homeowner_name'] ?? '';
    
    $expected = isset($_POST['expected']) && $_POST['expected'] === 'true' ? 1 : 0;
    $expected_time = $_POST['expected_time'] ?? null;
    $requested_by = $_SESSION['user_id'] ?? ''; // fallback to blank
    $id_photo_path = uploadIDPhoto('id_photo');

    $sql = "INSERT INTO entry_log 
        (name, visitor_count, package_details, vehicle_plate, reason, expected, expected_time, requested_by, homeowner_name, id_photo_path, entry_type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Entry', NOW())";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sisssisssss", 
        $name, $visitor_count, $package_details, $vehicle_plate, $reason, 
        $expected, $expected_time, $requested_by, $homeowner_name, $id_photo_path
    );

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Entry logged successfully"]);
        $description = "New entry log submitted for: $name";
        logAction($requested_by ?: 'guard', 'insert', $description, basename(__FILE__));
    } else {
        echo json_encode(["status" => "error", "message" => $stmt->error]);
    }

    $stmt->close();
}
?>
