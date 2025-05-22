<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';

if (!$id) {
    echo json_encode(["success" => false, "message" => "Missing vehicle ID"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM vehicle_registrations WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    logAction("user", "delete", "Deleted vehicle with ID $id", basename(__FILE__));
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete vehicle"]);
}

$stmt->close();
$conn->close();
?>
