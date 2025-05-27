<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

$id = $_POST['id'];
$type = $_POST['vehicle_type'];
$plate = $_POST['vehicle_plate'];
$name = $_POST['vehicle_name'];
$color = $_POST['vehicle_color'];

$stmt = $conn->prepare("UPDATE vehicle_registrations SET type_of_vehicle = ?, plate_number = ?, name = ?, color = ? WHERE id = ?");
$stmt->bind_param("ssssi", $type, $plate, $name, $color, $id);
$success = $stmt->execute();
$stmt->close();

echo json_encode(["success" => $success]);

echo json_encode(["success" => $success]);
?>
