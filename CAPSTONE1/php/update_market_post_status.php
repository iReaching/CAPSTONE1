<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_auth();
require_role(['admin']);

// Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS market_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  category ENUM('for_sale','for_rent') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL,
  approved_by VARCHAR(64) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$id = $_POST['id'] ?? '';
$action = $_POST['action'] ?? '';
if (!$id || !in_array($action, ['approve','reject'], true)) {
  echo json_encode(['success' => false, 'message' => 'Invalid request']);
  exit;
}

$status = $action === 'approve' ? 'approved' : 'rejected';
$admin_id = current_user_id();

$stmt = $conn->prepare("UPDATE market_posts SET status = ?, approved_at = NOW(), approved_by = ? WHERE id = ?");
$stmt->bind_param('ssi', $status, $admin_id, $id);

if ($stmt->execute()) {
  echo json_encode(['success' => true, 'message' => 'Post updated']);
} else {
  echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
$conn->close();
