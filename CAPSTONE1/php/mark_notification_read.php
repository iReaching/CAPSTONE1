<?php
include 'db_connect.php';
include 'cors.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? null;
$all = isset($_GET['all']) ? (int)$_GET['all'] : 0;
$user_id = $_GET['user_id'] ?? ($_POST['user_id'] ?? ( $_COOKIE['user_id'] ?? null));

// Ensure table exists (safe if already exists)
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

if ($all === 1 && $user_id) {
  $stmt = $conn->prepare("UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL");
  $stmt->bind_param('s', $user_id);
  $ok = $stmt->execute();
  $stmt->close();
  echo json_encode(['success' => $ok]);
  $conn->close();
  exit;
}

if (!$id) { echo json_encode(['success'=>false,'message'=>'Missing id']); $conn->close(); exit; }

$stmt = $conn->prepare("UPDATE notifications SET read_at = NOW() WHERE id = ?");
$stmt->bind_param('i', $id);
$ok = $stmt->execute();
$stmt->close();

echo json_encode(['success' => $ok]);
$conn->close();
?>
