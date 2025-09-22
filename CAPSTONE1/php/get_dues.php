<?php
include 'db_connect.php';
include 'cors.php';
header("Content-Type: application/json");

$user_id = $_GET['user_id'] ?? null;

if ($user_id) {
  $stmt = $conn->prepare("SELECT * FROM monthly_dues WHERE user_id = ? ORDER BY due_month DESC");
  $stmt->bind_param("s", $user_id);
  $stmt->execute();
  $result = $stmt->get_result();
} else {
  $result = $conn->query("SELECT * FROM monthly_dues ORDER BY due_month DESC, user_id ASC");
}

$dues = [];
while ($row = $result->fetch_assoc()) {
  $dues[] = $row;
}

echo json_encode($dues);
$conn->close();
?>
