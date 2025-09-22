<?php
include 'db_connect.php';
include 'cors.php';
header("Content-Type: application/json");

$sql = "SELECT * FROM system_logs ORDER BY timestamp DESC";
$result = $conn->query($sql);

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}

echo json_encode($logs);
$conn->close();
?>
