<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../PHP/db_connect.php';

$sql = "SELECT 
          isched.id,
          isched.homeowner_id,
          up.full_name AS requested_by,
          i.name AS item_name,
          isched.message,
          isched.request_date,
          isched.time_start,
          isched.time_end,
          isched.status
        FROM item_schedule isched
        JOIN items i ON isched.item_id = i.id
        JOIN user_profiles up ON isched.homeowner_id = up.user_id
        ORDER BY isched.request_date DESC";

$result = $conn->query($sql);

$schedules = [];
while ($row = $result->fetch_assoc()) {
  $schedules[] = $row;
}

echo json_encode($schedules);
?>
