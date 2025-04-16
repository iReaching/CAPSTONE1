<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../PHP/db_connect.php';

$data = json_decode(file_get_contents("php://input"));
$id = $data->id;
$status = $data->status;

$stmt = $conn->prepare("UPDATE item_schedule SET status = ? WHERE id = ?");
$stmt->bind_param("si", $status, $id);
$stmt->execute();

echo json_encode(["message" => "Item schedule updated"]);
?>
