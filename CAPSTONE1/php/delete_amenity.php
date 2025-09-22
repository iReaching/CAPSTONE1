<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';

if (!$id) {
    echo json_encode(["success" => false, "message" => "Missing amenity ID."]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM amenities WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    $userId = $_SESSION['user_id'] ?? 'unknown';
    logAction($userId, 'delete', "Deleted amenity ID: $id", basename(__FILE__));
    echo json_encode(["success" => true, "message" => "Amenity deleted successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to delete amenity."]);
}

$stmt->close();
$conn->close();

?>
