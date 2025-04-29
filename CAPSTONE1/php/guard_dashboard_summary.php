<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db_connect.php';

$response = [
  "entries_today" => 0,
  "expected_guests" => 0
];

$today = date('Y-m-d');

$stmt = $conn->prepare("SELECT COUNT(*) as count FROM entry_log WHERE entry_type = 'Entry' AND DATE(timestamp) = ?");
$stmt->bind_param("s", $today);
$stmt->execute();
$result = $stmt->get_result();
if ($row = $result->fetch_assoc()) {
  $response["entries_today"] = $row['count'];
}
$stmt->close();

$sql = "SELECT COUNT(*) as count FROM entry_log WHERE expected = 1";
$result = $conn->query($sql);
if ($row = $result->fetch_assoc()) {
  $response["expected_guests"] = $row['count'];
}

echo json_encode($response);
$conn->close();
?>
