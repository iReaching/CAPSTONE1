<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../PHP/db_connect.php';

$data = json_decode(file_get_contents("php://input"));
$id = $data->id;

$stmt = $conn->prepare("DELETE FROM items WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

echo json_encode(["message" => "Item deleted"]);
?>
