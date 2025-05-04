<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amenity_id = $_POST['amenity_id'] ?? '';
    $user_id = $_POST['user_id'] ?? '';
    $date = $_POST['date'] ?? '';
    $start_time = $_POST['start_time'] ?? '';
    $end_time = $_POST['end_time'] ?? '';
    $purpose = $_POST['purpose'] ?? '';

    if (!$amenity_id || !$user_id || !$date || !$start_time || !$end_time || !$purpose) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO amenity_schedule (amenity_id, homeowner_id, date, start_time, end_time, purpose, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("ssssss", $amenity_id, $user_id, $date, $start_time, $end_time, $purpose);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }

    $stmt->close();
    $conn->close();
}
?>
