<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);
$user_id = $_GET['user_id'] ?? '';
if (!$user_id) { echo json_encode(['entries'=>[]]); exit; }

$conn->query("CREATE TABLE IF NOT EXISTS dues_ledger (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  due_id INT NULL,
  entry_type ENUM('charge','payment','late_fee','adjustment') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id), INDEX idx_due (due_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$sql = "SELECT id, user_id, due_id, entry_type, amount, note, created_at FROM dues_ledger WHERE user_id=? ORDER BY created_at DESC, id DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $user_id);
$stmt->execute();
$res = $stmt->get_result();
$out = [];
while ($row = $res->fetch_assoc()) { $out[] = $row; }
$stmt->close();

echo json_encode(['entries'=>$out]);
$conn->close();
?>