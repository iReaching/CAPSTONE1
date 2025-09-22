<?php
// log_action.php
include 'db_connect.php';
include 'cors.php';

function logAction($userId, $actionType, $description, $sourceFile = null) {
    global $conn;

    // Validate required values
    if (!$userId || !$actionType || !$description) return;

    $stmt = $conn->prepare("
        INSERT INTO system_logs (user_id, action_type, description, source_file)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->bind_param("ssss", $userId, $actionType, $description, $sourceFile);
    $stmt->execute();
    $stmt->close();
}
?>
