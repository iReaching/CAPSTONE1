<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

include 'db_connect.php';
include 'log_action.php';

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $name = $_POST['name'] ?? '';
    $color = $_POST['color'] ?? '';
    $type = $_POST['type_of_vehicle'] ?? '';
    $plate_number = $_POST['plate_number'] ?? '';
    $block = $_POST['block'] ?? '';
    $lot = $_POST['lot'] ?? '';

    if (!$user_id || !$name || !$color || !$type || !$plate_number || !$block || !$lot || !isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['message' => 'All fields are required.']);
        exit;
    }

    $target_dir = "../../uploads/";
    if (!file_exists($target_dir)) mkdir($target_dir, 0777, true);

    $image = $_FILES['image'];
    $filename = time() . '_' . basename($image["name"]);
    $target_file = $target_dir . $filename;
    $relative_path = "uploads/" . $filename;

    if (move_uploaded_file($image["tmp_name"], $target_file)) {
        $stmt = $conn->prepare("INSERT INTO vehicle_registrations (user_id, name, color, type_of_vehicle, plate_number, block, lot, vehicle_pic_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssss", $user_id, $name, $color, $type, $plate_number, $block, $lot, $relative_path);

        if ($stmt->execute()) {
            logAction($user_id, 'upload', "Registered vehicle $plate_number", 'submit_vehicle.php');
            $response['success'] = true;
            $response['message'] = "Vehicle registered successfully.";
        } else {
            http_response_code(500);
            $response['success'] = false;
            $response['message'] = "Database error: " . $stmt->error;
        }

        $stmt->close();
    } else {
        http_response_code(500);
        $response['success'] = false;
        $response['message'] = "Failed to upload image.";
    }
} else {
    http_response_code(405);
    $response['message'] = "Invalid request method.";
}

echo json_encode($response);
$conn->close();
?>
