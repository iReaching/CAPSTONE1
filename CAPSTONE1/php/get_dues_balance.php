<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

// If user_id is present, return single balance; else return list by user
$requested_user = $_GET['user_id'] ?? null;

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

// charges + late_fee are positive; payments negative; adjustments can be positive or negative (store sign using amount in ledger)
// We'll compute: balance = SUM(
//   CASE WHEN entry_type IN ('charge','late_fee') THEN amount
//        WHEN entry_type='payment' THEN -amount
//        ELSE amount END)

if ($requested_user) {
  $stmt = $conn->prepare("SELECT COALESCE(SUM(CASE WHEN entry_type IN ('charge','late_fee') THEN amount WHEN entry_type='payment' THEN -amount ELSE amount END),0) AS balance FROM dues_ledger WHERE user_id=?");
  $stmt->bind_param('s', $requested_user);
  $stmt->execute();
  $res = $stmt->get_result();
  $row = $res->fetch_assoc();
  $stmt->close();
  echo json_encode(['user_id'=>$requested_user, 'balance'=> (float)($row['balance'] ?? 0)]);
  $conn->close();
  exit;
}

// List of balances by user
$sql = "SELECT user_id, COALESCE(SUM(CASE WHEN entry_type IN ('charge','late_fee') THEN amount WHEN entry_type='payment' THEN -amount ELSE amount END),0) AS balance FROM dues_ledger GROUP BY user_id ORDER BY user_id";
$res = $conn->query($sql);
$list = [];
while ($r = $res->fetch_assoc()) { $list[] = ['user_id'=>$r['user_id'], 'balance'=>(float)$r['balance']]; }

// Attach profile names and roles if tables exist
$names = [];
$roles = [];
$ids = array_map(function($x){ return $x['user_id']; }, $list);
if (count($ids)>0) {
  $in = implode(',', array_fill(0, count($ids), '?'));
  $types = str_repeat('s', count($ids));
  // user_profiles
  $chk = $conn->query("SHOW TABLES LIKE 'user_profiles'");
  if ($chk && $chk->num_rows>0) {
    $st = $conn->prepare("SELECT user_id, full_name FROM user_profiles WHERE user_id IN ($in)");
    $st->bind_param($types, ...$ids);
    $st->execute(); $rr = $st->get_result();
    while ($row = $rr->fetch_assoc()) { $names[$row['user_id']] = $row['full_name']; }
    $st->close();
  }
  // users table for role
  $chk2 = $conn->query("SHOW TABLES LIKE 'users'");
  if ($chk2 && $chk2->num_rows>0) {
    $st2 = $conn->prepare("SELECT user_id, role FROM users WHERE user_id IN ($in)");
    $st2->bind_param($types, ...$ids);
    $st2->execute(); $rr2 = $st2->get_result();
    while ($row = $rr2->fetch_assoc()) { $roles[$row['user_id']] = $row['role']; }
    $st2->close();
  }
}
foreach ($list as &$it) { if (isset($names[$it['user_id']])) $it['full_name']=$names[$it['user_id']]; if (isset($roles[$it['user_id']])) $it['role']=$roles[$it['user_id']]; }

echo json_encode(['balances'=>$list]);
$conn->close();
?>