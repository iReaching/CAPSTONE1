<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Missing item ID"]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM items WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        $userId = $_SESSION['user_id'] ?? 'unknown';
        logAction($userId, 'delete', "Deleted item ID: $id", basename(__FILE__));
        echo json_encode(["success" => true, "message" => "Item deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete item."]);
    }

    $stmt->close();
    $conn->close();
}

?>
