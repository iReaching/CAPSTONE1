<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

$response = ["success" => false];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST["name"];
    $description = $_POST["description"];

    $uploadDir = "./uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $imagePath = "";

    if (!empty($_FILES["image"]["name"])) {
        $fileName = uniqid() . "_" . basename($_FILES["image"]["name"]);
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetPath)) {
            $imagePath = $fileName;
        } else {
            echo json_encode(["success" => false, "message" => "Image upload failed."]);
            exit;
        }
    }

    $stmt = $conn->prepare("INSERT INTO amenities (name, description, image) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $description, $imagePath);

    if ($stmt->execute()) {
        $response["success"] = true;
        $userId = $_POST['user_id'] ?? 'unknown';  // Send this from frontend
        $description = "Added new amenity: $name";
        logAction($userId, 'insert', $description, basename(__FILE__));
    } else {
        $response["message"] = $stmt->error;
    }

    $stmt->close();
}

echo json_encode($response);
$conn->close();
