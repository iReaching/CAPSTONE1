<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$status = $_GET['status'] ?? 'pending';

$conn->query("CREATE TABLE IF NOT EXISTS advance_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  proof_path VARCHAR(255) NULL,
  gcash_reference VARCHAR(64) NULL,
  gcash_sender_name VARCHAR(128) NULL,
  gcash_sender_mobile VARCHAR(32) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by VARCHAR(64) NULL,
  reviewed_at DATETIME NULL,
  note VARCHAR(255) NULL,
  INDEX idx_user_status (user_id, status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$stmt = $conn->prepare("SELECT * FROM advance_payments WHERE status = ? ORDER BY created_at DESC");
$stmt->bind_param('s', $status);
$stmt->execute();
$res = $stmt->get_result();
$list = [];
while ($row = $res->fetch_assoc()) { $list[] = $row; }
$stmt->close();

echo json_encode(['payments'=>$list]);
$conn->close();
?>