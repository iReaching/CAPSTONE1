<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$result = $conn->query("
  SELECT a.id, a.title, a.content AS body, a.date_posted, u.user_id, u.email
  FROM announcements a
  JOIN users u ON a.posted_by = u.user_id
  ORDER BY a.date_posted DESC
");

$announcements = [];

while ($row = $result->fetch_assoc()) {
  $announcements[] = $row;
}

echo json_encode($announcements);
$conn->close();
?>
