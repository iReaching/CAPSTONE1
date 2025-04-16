<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../PHP/db_connect.php';

$sql = "SELECT 
          asched.id,
          asched.homeowner_id,
          up.full_name AS requested_by,
          a.name AS amenity_name,
          asched.message,
          asched.request_date,
          asched.time_start,
          asched.time_end,
          asched.status
        FROM amenity_schedule asched
        JOIN amenities a ON asched.amenity_id = a.id
        JOIN user_profiles up ON asched.homeowner_id = up.user_id
        ORDER BY asched.request_date DESC";

$result = $conn->query($sql);

$schedules = [];
while ($row = $result->fetch_assoc()) {
  $schedules[] = $row;
}

echo json_encode($schedules);
?>
