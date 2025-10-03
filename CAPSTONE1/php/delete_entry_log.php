<?php
include 'cors.php'; 

header("Content-Type: application/json");

include 'db_connect.php';
include 'log_action.php';

$id = $_POST['id'] ?? null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "Missing ID"]);
    exit;
}

$sql = "DELETE FROM entry_log WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    $userId = $_SESSION['user_id'] ?? 'unknown';
    logAction($userId, 'delete', "Deleted entry log ID: $id", basename(__FILE__));
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();

?>
