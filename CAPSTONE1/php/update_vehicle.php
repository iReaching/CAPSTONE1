<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';
$vehicle_type = $_POST['vehicle_type'] ?? '';
$vehicle_plate = $_POST['vehicle_plate'] ?? '';

if (!$id || !$vehicle_type || !$vehicle_plate) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$stmt = $conn->prepare("UPDATE vehicle_registrations SET type_of_vehicle = ?, plate_number = ? WHERE id = ?");
$stmt->bind_param("ssi", $vehicle_type, $vehicle_plate, $id);

if ($stmt->execute()) {
    logAction("user", "update", "Updated vehicle with ID $id", basename(__FILE__));
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update vehicle"]);
}

$stmt->close();
$conn->close();
?>
