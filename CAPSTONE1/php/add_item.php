<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../PHP/db_connect.php';

$name = $_POST['name'];
$quantity = $_POST['quantity'];

$image_path = "";
if (!empty($_FILES['image']['name'])) {
  $target_dir = "../uploads/";
  $image_path = "uploads/" . basename($_FILES["image"]["name"]);
  move_uploaded_file($_FILES["image"]["tmp_name"], $target_dir . basename($_FILES["image"]["name"]));
}

$stmt = $conn->prepare("INSERT INTO items (name, quantity, image_path) VALUES (?, ?, ?)");
$stmt->bind_param("sis", $name, $quantity, $image_path);
$stmt->execute();

echo json_encode(["message" => "Item added successfully"]);
?>
