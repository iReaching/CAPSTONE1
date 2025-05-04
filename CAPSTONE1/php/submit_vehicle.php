<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$uploadDir = "uploads/";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $vehicle_name = $_POST['vehicle_name'] ?? '';
    $type_of_vehicle = $_POST['type_of_vehicle'] ?? '';
    $color = $_POST['color'] ?? '';
    $plate_number = $_POST['plate_number'] ?? '';
    $block = $_POST['block'] ?? '';
    $lot = $_POST['lot'] ?? '';

    if (!$user_id || !$vehicle_name || !$type_of_vehicle || !$color || !$plate_number || !$block || !$lot) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $filePath = "";
    if (!empty($_FILES["vehicle_pic"]["name"])) {
        $fileName = basename($_FILES["vehicle_pic"]["name"]);
        $filePath = $uploadDir . uniqid() . "_" . $fileName;
        if (!move_uploaded_file($_FILES["vehicle_pic"]["tmp_name"], $filePath)) {
            echo json_encode(["success" => false, "message" => "Failed to upload image."]);
            exit;
        }
    }

    $stmt = $conn->prepare("INSERT INTO vehicle_registrations (user_id, name, type_of_vehicle, color, plate_number, block, lot, vehicle_pic_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssssss", $user_id, $vehicle_name, $type_of_vehicle, $color, $plate_number, $block, $lot, $filePath);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }

    $stmt->close();
    $conn->close();
}
?>
