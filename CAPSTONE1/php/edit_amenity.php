<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amenity_id = $_POST["amenity_id"] ?? null;
    $new_name = trim($_POST["new_name"] ?? "");
    $new_description = trim($_POST["new_description"] ?? "");
    $uploadDir = "./uploads/";

    if (!$amenity_id) {
        echo json_encode(["success" => false, "message" => "Missing amenity ID."]);
        exit;
    }

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $imagePath = "";
    if (!empty($_FILES["new_image"]["name"])) {
        $fileName = uniqid() . "_" . basename($_FILES["new_image"]["name"]);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES["new_image"]["tmp_name"], $targetPath)) {
            $imagePath = $fileName;
        } else {
            echo json_encode(["success" => false, "message" => "Image upload failed."]);
            exit;
        }
    }

    $fields = [];
    $params = [];
    $types = "";

    if ($new_name !== "") {
        $fields[] = "name = ?";
        $params[] = $new_name;
        $types .= "s";
    }

    if ($new_description !== "") {
        $fields[] = "description = ?";
        $params[] = $new_description;
        $types .= "s";
    }

    if ($imagePath !== "") {
        $fields[] = "image = ?";
        $params[] = $imagePath;
        $types .= "s";
    }

    if (empty($fields)) {
        echo json_encode(["success" => false, "message" => "No updates provided."]);
        exit;
    }

    $params[] = $amenity_id;
    $types .= "i";

    $sql = "UPDATE amenities SET " . implode(", ", $fields) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        // Logging the update
        $userId = $_POST['user_id'] ?? 'admin'; // update to session/user context if needed
        $desc = "Updated amenity ID $amenity_id";
        logAction($userId, 'update', $desc, 'edit_amenity.php');

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
?>
