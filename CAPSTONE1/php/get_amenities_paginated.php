<?php
include 'db_connect.php';
include 'cors.php';
header("Content-Type: application/json");

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = 1; // 1 per page like your Bootstrap layout
$offset = ($page - 1) * $limit;

$total = $conn->query("SELECT COUNT(*) as total FROM amenities")->fetch_assoc()['total'];

$query = $conn->prepare("SELECT * FROM amenities LIMIT ? OFFSET ?");
$query->bind_param("ii", $limit, $offset);
$query->execute();
$result = $query->get_result();

$amenities = [];
while ($row = $result->fetch_assoc()) {
    $amenities[] = $row;
}

echo json_encode([
    "amenities" => $amenities,
    "total" => $total,
    "limit" => $limit
]);
?>
