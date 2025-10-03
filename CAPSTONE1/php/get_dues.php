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

// Load settings for due policy and late fee
$conn->query("CREATE TABLE IF NOT EXISTS app_settings (\n  `key` VARCHAR(64) PRIMARY KEY,\n  `value` TEXT NOT NULL\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
$settings = [];
$sr = $conn->query("SELECT `key`,`value` FROM app_settings");
if ($sr) { while ($srow = $sr->fetch_assoc()) { $settings[$srow['key']] = $srow['value']; } }
$due_day = isset($settings['dues_due_day']) ? (int)$settings['dues_due_day'] : 10;
if ($due_day < 1) $due_day = 1; if ($due_day > 28) $due_day = 28;
$late_type = isset($settings['dues_late_fee_type']) ? $settings['dues_late_fee_type'] : 'percent';
$late_val = isset($settings['dues_late_fee_value']) ? (float)$settings['dues_late_fee_value'] : 0.05; // 5% default

$today = new DateTime('now');

// Prepare ledger sum statements (reuse per row)
$sel_pay = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM dues_ledger WHERE due_id=? AND entry_type='payment'");
$sel_late = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM dues_ledger WHERE due_id=? AND entry_type='late_fee'");
$sel_adj = $conn->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM dues_ledger WHERE due_id=? AND entry_type='adjustment'");

$dues = [];
while ($row = $result->fetch_assoc()) {
  $row_is_paid = isset($row['is_paid']) ? (int)$row['is_paid'] : 0;
  $amount = isset($row['amount_due']) ? (float)$row['amount_due'] : 0.0;
  $due_month = isset($row['due_month']) ? $row['due_month'] : null; // YYYY-MM
  $due_id = isset($row['id']) ? (int)$row['id'] : 0;

  // Determine due_date: use stored if present, otherwise compute from settings and persist once
  $due_date = null;
  if (!empty($row['due_date'])) {
    $due_date = $row['due_date'];
  } else if ($due_month && preg_match('/^\d{4}-\d{2}$/', $due_month)) {
    $y = (int)substr($due_month, 0, 4);
    $m = (int)substr($due_month, 5, 2);
    if ($y > 0 && $m >= 1 && $m <= 12) {
      $day_due = min($due_day, cal_days_in_month(CAL_GREGORIAN, $m, $y));
      $due_date = sprintf('%04d-%02d-%02d', $y, $m, $day_due);
      // persist if column exists
      $conn->query("ALTER TABLE monthly_dues ADD COLUMN IF NOT EXISTS due_date DATE NULL");
      $st = $conn->prepare("UPDATE monthly_dues SET due_date=? WHERE id=? AND due_date IS NULL");
      $st->bind_param('si', $due_date, $due_id);
      $st->execute(); $st->close();
    }
  }

  $is_overdue = 0;
  if ($due_date) {
    $is_overdue = ((int)$today->format('Ymd') > (int)str_replace('-', '', $due_date)) ? 1 : 0;
  }

  // Ledger-driven sums for this due
  $paid_total = 0.0; $late_total = 0.0; $adj_total = 0.0;
  if ($due_id) {
    $sel_pay->bind_param('i', $due_id); $sel_pay->execute(); $r1 = $sel_pay->get_result()->fetch_assoc(); $paid_total = (float)$r1['s'];
    $sel_late->bind_param('i', $due_id); $sel_late->execute(); $r2 = $sel_late->get_result()->fetch_assoc(); $late_total = (float)$r2['s'];
    $sel_adj->bind_param('i', $due_id); $sel_adj->execute(); $r3 = $sel_adj->get_result()->fetch_assoc(); $adj_total = (float)$r3['s'];
  }

  // Outstanding is base + late + adjustments (due-bound) minus payments
  $outstanding = round($amount + $late_total + $adj_total - $paid_total, 2);
  if ($outstanding < 0) $outstanding = 0.00; // clamp for display

  $row['due_date'] = $due_date;
  $row['is_overdue'] = $is_overdue;
  $row['paid_total'] = $paid_total;
  $row['late_total'] = $late_total;
  $row['adjustment_total'] = $adj_total;
  $row['outstanding'] = $outstanding;

  $dues[] = $row;
}

echo json_encode($dues);
$conn->close();
?>
