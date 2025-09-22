<?php
include 'db_connect.php';
include 'log_action.php';

include 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $vehicle_plate = $_POST['vehicle_plate'] ?? '';
    $reason = $_POST['reason'] ?? '';
    $expected_time = $_POST['expected_time'] ?? '';
    $requested_by = $_POST['requested_by'] ?? '';
    $visitor_count = isset($_POST['visitor_count']) ? (int)$_POST['visitor_count'] : 1;
    $package_details = $_POST['package_details'] ?? '';
    $homeowner_name = $_POST['homeowner_name'] ?? '';
    $expected = $expected_time !== '' ? 1 : 0;

    if (!$name || !$reason || !$requested_by || !$homeowner_name) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO entry_log 
        (name, visitor_count, package_details, vehicle_plate, reason, expected, expected_time, requested_by, homeowner_name, entry_type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Entry', NOW())
    ");
    $stmt->bind_param(
        "sisssisss",
        $name, $visitor_count, $package_details, $vehicle_plate,
        $reason, $expected, $expected_time, $requested_by, $homeowner_name
    );

    if ($stmt->execute()) {
        logAction($requested_by, 'insert', "Requested entry log for guest: $name", 'request_entrylog.php');
        echo json_encode(["success" => true, "message" => "Entry log request submitted."]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
