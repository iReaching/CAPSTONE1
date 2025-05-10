<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$user_id = $_GET['user_id'] ?? '';

if (!$user_id) {
    echo json_encode([]);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM entry_log WHERE requested_by = ? ORDER BY timestamp DESC");
$stmt->bind_param("s", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}

echo json_encode($logs);
$stmt->close();
$conn->close();
