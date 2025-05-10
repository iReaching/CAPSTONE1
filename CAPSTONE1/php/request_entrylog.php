<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $vehicle_plate = $_POST['vehicle_plate'] ?? '';
    $reason = $_POST['reason'] ?? '';
    $expected_time = $_POST['expected_time'] ?? '';
    $requested_by = $_POST['requested_by'] ?? '';
    $expected = $expected_time !== '' ? 1 : 0;

    if (!$name || !$reason || !$requested_by) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $stmt = $conn->prepare("
        INSERT INTO entry_log (name, entry_type, vehicle_plate, reason, expected, expected_time, requested_by, timestamp)
        VALUES (?, 'Entry', ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->bind_param("sssiis", $name, $vehicle_plate, $reason, $expected, $expected_time, $requested_by);

    if ($stmt->execute()) {
        logAction($requested_by, 'insert', "Requested entry log for guest: $name", 'request_entrylog.php');
        echo json_encode(["success" => true, "message" => "Entry log request submitted."]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }

    $stmt->close();
    $conn->close();
}

?>
