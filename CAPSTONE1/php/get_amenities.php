<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$result = $conn->query("SELECT * FROM amenities ORDER BY id DESC");

$amenities = [];
while ($row = $result->fetch_assoc()) {
    $amenities[] = $row;
}

echo json_encode($amenities);
$conn->close();
