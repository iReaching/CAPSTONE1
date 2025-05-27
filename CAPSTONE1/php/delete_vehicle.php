<?php
include 'db_connect.php';
header("Content-Type: application/json");

$id = $_POST['id'];

$stmt = $conn->prepare("DELETE FROM vehicle_registrations WHERE id = ?");
$stmt->bind_param("i", $id);
$success = $stmt->execute();
$stmt->close();

echo json_encode(["success" => $success]);
?>
