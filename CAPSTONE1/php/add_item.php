<?php
include 'cors.php';
header("Content-Type: application/json");

include 'db_connect.php';
include 'log_action.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $available = $_POST['quantity'] ?? 0;
    
    $uploadDir = "./uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $imagePath = "";
    if (!empty($_FILES['image']['name'])) {
        $fileName = uniqid() . "_" . basename($_FILES["image"]["name"]);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetPath)) {
            $imagePath = $fileName;
        } else {
            echo json_encode(["success" => false, "message" => "Image upload failed."]);
            exit;
        }
    }
    
    $stmt = $conn->prepare("INSERT INTO items (name, available, image) VALUES (?, ?, ?)");
    $stmt->bind_param("sis", $name, $available, $imagePath);
    
    if ($stmt->execute()) {
        $user_id = $_POST['user_id'] ?? 'admin';
        $description = "Added new item: $name (Available: $available)";
        logAction($user_id, 'insert', $description, basename(__FILE__));
        
        echo json_encode(["success" => true, "message" => "Item added successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Insert failed: " . $stmt->error]);
    }
    
    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
?>
