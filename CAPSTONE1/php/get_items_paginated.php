<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include '../PHP/db_connect.php';

$limit = 1; // Items per page
$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$start = ($page - 1) * $limit;

// Count total items
$countSql = "SELECT COUNT(*) AS total FROM items WHERE available > 0";
$countResult = $conn->query($countSql);
$total = $countResult->fetch_assoc()['total'];

// Fetch paginated items
$sql = "SELECT * FROM items WHERE available > 0 ORDER BY created_at DESC LIMIT ?, ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $start, $limit);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
  $items[] = $row;
}

echo json_encode([
  "items" => $items,
  "total" => $total,
  "limit" => $limit,
  "page" => $page
]);
?>
