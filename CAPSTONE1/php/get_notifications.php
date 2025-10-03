<?php
include 'db_connect.php';
include 'cors.php';
header('Content-Type: application/json');

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
  echo json_encode(['notifications' => []]);
  exit;
}

// Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  message TEXT,
  severity VARCHAR(16) DEFAULT 'info',
  link_url VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  INDEX idx_notifications_user_time (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$stmt = $conn->prepare("SELECT id, user_id, title, message, severity, link_url, created_at, read_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100");
$stmt->bind_param('s', $user_id);
$stmt->execute();
$res = $stmt->get_result();
$list = [];
while ($row = $res->fetch_assoc()) { $list[] = $row; }
$stmt->close();

echo json_encode(['notifications' => $list]);
$conn->close();
?>
