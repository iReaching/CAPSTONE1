<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include '../PHP/db_connect.php';

$result = $conn->query("SELECT * FROM item_schedule");

$requests = [];
while ($row = $result->fetch_assoc()) {
  $requests[] = $row;
}

echo json_encode($requests);
?>
