<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../PHP/db_connect.php';

$sql = "SELECT * FROM maintenance_reports ORDER BY date_submitted DESC";
$result = $conn->query($sql);

$reports = [];
while ($row = $result->fetch_assoc()) {
  $reports[] = $row;
}

echo json_encode($reports);
?>
