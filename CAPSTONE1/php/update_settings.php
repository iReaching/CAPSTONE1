<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$allowed_keys = ['gcash_name','gcash_mobile','gcash_qr_url','per_sqm_rate','dues_due_day','dues_grace_days','dues_reminder_interval_days','dues_max_reminders','dues_late_fee_type','dues_late_fee_value'];

// Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS app_settings (
  `key` VARCHAR(64) PRIMARY KEY,
  `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$updates = [];
foreach ($allowed_keys as $k) {
  if (isset($_POST[$k])) { $updates[$k] = $_POST[$k]; }
}

if (!$updates) { echo json_encode(['success'=>false,'message'=>'No changes']); exit; }

$stmt = $conn->prepare("REPLACE INTO app_settings (`key`,`value`) VALUES (?,?)");
foreach ($updates as $k=>$v) { $stmt->bind_param('ss',$k,$v); $stmt->execute(); }
$stmt->close();

echo json_encode(['success'=>true]);
$conn->close();
?>