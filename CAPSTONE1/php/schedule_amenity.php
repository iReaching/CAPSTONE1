<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amenity_id = $_POST['amenity_id'] ?? '';
    $homeowner_id = $_POST['homeowner_id'] ?? '';
    $house_id = $_POST['house_id'] ?? '';
    $request_date = $_POST['request_date'] ?? '';
    $message = $_POST['message'] ?? '';
    $time_start = $_POST['time_start'] ?? '';
    $time_end = $_POST['time_end'] ?? '';

    if (!$amenity_id || !$homeowner_id || !$house_id || !$request_date || !$time_start || !$time_end) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO amenity_schedule (amenity_id, homeowner_id, house_id, request_date, message, time_start, time_end, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("sssssss", $amenity_id, $homeowner_id, $house_id, $request_date, $message, $time_start, $time_end);

    if ($stmt->execute()) {
        logAction($homeowner_id, 'insert', "Requested amenity ID $amenity_id on $request_date", 'schedule_amenity.php');
        echo json_encode(["success" => true, "message" => "Request submitted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }

    $stmt->close();
    $conn->close();
}

?>
