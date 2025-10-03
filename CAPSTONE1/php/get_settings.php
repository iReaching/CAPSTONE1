<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

$allowed_keys = ['gcash_name','gcash_mobile','gcash_qr_url','per_sqm_rate','dues_due_day','dues_grace_days','dues_reminder_interval_days','dues_max_reminders','dues_late_fee_type','dues_late_fee_value'];

// Ensure table exists
$conn->query("CREATE TABLE IF NOT EXISTS app_settings (
  `key` VARCHAR(64) PRIMARY KEY,
  `value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Fetch all allowed keys
$rows = [];
$res = $conn->query("SELECT `key`, `value` FROM app_settings");
while ($r = $res->fetch_assoc()) { $rows[$r['key']] = $r['value']; }

// Only return allowed keys
$out = [];
foreach ($allowed_keys as $k) { if (isset($rows[$k])) { $out[$k] = $rows[$k]; } }

echo json_encode($out);
$conn->close();
?>