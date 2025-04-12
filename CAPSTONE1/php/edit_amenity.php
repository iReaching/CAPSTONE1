<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amenity_id = $_POST["amenity_id"];
    $new_name = $_POST["new_name"] ?? null;
    $new_description = $_POST["new_description"] ?? null;
    $uploadDir = "../uploads/";

    // Ensure upload directory exists
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $imagePath = "";
    if (!empty($_FILES["new_image"]["name"])) {
        $fileName = uniqid() . "_" . basename($_FILES["new_image"]["name"]);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES["new_image"]["tmp_name"], $targetPath)) {
            $imagePath = "uploads/" . $fileName;
        } else {
            echo json_encode(["success" => false, "message" => "Image upload failed."]);
            exit;
        }
    }

    // Build SQL query dynamically
    $fields = [];
    $params = [];
    $types = "";

    if ($new_name !== null) {
        $fields[] = "name = ?";
        $params[] = $new_name;
        $types .= "s";
    }

    if ($new_description !== null) {
        $fields[] = "description = ?";
        $params[] = $new_description;
        $types .= "s";
    }

    if ($imagePath !== "") {
        $fields[] = "image = ?";
        $params[] = $imagePath;
        $types .= "s";
    }

    $params[] = $amenity_id;
    $types .= "i";

    $sql = "UPDATE amenities SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
