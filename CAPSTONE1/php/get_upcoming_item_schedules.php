<?php
include 'cors.php';
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
include 'db_connect.php';

$sql = "SELECT s.*, i.name AS item_name, up.full_name 
        FROM item_schedule s 
        JOIN items i ON s.item_id = i.id 
        JOIN user_profiles up ON s.homeowner_id = up.user_id 
        WHERE s.status = 'approved' 
        ORDER BY s.request_date ASC 
        LIMIT 5";

$result = $conn->query($sql);
$data = [];
while ($row = $result->fetch_assoc()) {
  $data[] = $row;
}
echo json_encode($data);
?>
