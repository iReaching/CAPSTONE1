<?php
// send_dues_reminders.php
// Lightweight script to generate reminder notifications for overdue or due monthly dues.
// You can trigger this manually (visit via browser) or set up a cron job to hit this URL periodically.

include 'db_connect.php';
include 'cors.php';
header('Content-Type: application/json');

function get_setting($conn, $key, $default=null) {
  $stmt = $conn->prepare("SELECT `value` FROM app_settings WHERE `key`=?");
  $stmt->bind_param('s', $key);
  $stmt->execute();
  $res = $stmt->get_result();
  $row = $res->fetch_assoc();
  $stmt->close();
  return $row ? $row['value'] : $default;
}

// Ensure tables exist
$conn->query("CREATE TABLE IF NOT EXISTS app_settings (`key` VARCHAR(64) PRIMARY KEY, `value` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
$conn->query("CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) DEFAULT NULL,
  message TEXT,
  severity VARCHAR(16) DEFAULT 'info',
  link_url VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  INDEX idx_notifications_user_time (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Policy settings with defaults
$due_day = (int)(get_setting($conn, 'dues_due_day', '10'));
if ($due_day < 1) $due_day = 1; if ($due_day > 28) $due_day = 28; // keep safe
$grace_days = (int)(get_setting($conn, 'dues_grace_days', '5'));
if ($grace_days < 0) $grace_days = 0;
$rem_int = (int)(get_setting($conn, 'dues_reminder_interval_days', '7'));
if ($rem_int < 1) $rem_int = 7;
$rem_max = (int)(get_setting($conn, 'dues_max_reminders', '3'));
if ($rem_max < 1) $rem_max = 3;
$late_type = get_setting($conn, 'dues_late_fee_type', 'percent');
$late_val = (float)get_setting($conn, 'dues_late_fee_value', '0.05');

// Fetch unpaid dues
$q = $conn->query("SHOW COLUMNS FROM monthly_dues LIKE 'is_paid'");
if (!$q || $q->num_rows === 0) {
  echo json_encode(['success'=>false,'message'=>'monthly_dues.is_paid not found']);
  $conn->close();
  exit;
}

$conn->query("ALTER TABLE monthly_dues ADD COLUMN IF NOT EXISTS late_fee_applied TINYINT(1) DEFAULT 0");
$sql = "SELECT id, user_id, amount_due, due_month, due_date, grace_days, reminder_count, last_reminder_at, late_fee_applied
        FROM monthly_dues
        WHERE (is_paid = 0 OR is_paid IS NULL)";
$res = $conn->query($sql);

$now = new DateTime('now');
$count = 0;
$updated = 0;

while ($row = $res->fetch_assoc()) {
  $id = (int)$row['id'];
  $user_id = $row['user_id'];
  $amount = (float)$row['amount_due'];
  $due_month = $row['due_month']; // YYYY-MM
  $due_date_str = $row['due_date'];
  $row_grace = isset($row['grace_days']) ? (int)$row['grace_days'] : null;
  $rcount = isset($row['reminder_count']) ? (int)$row['reminder_count'] : 0;
  $last_at = $row['last_reminder_at'];

  // Compute due_date if not set
  $due_date = null;
  if ($due_date_str) {
    $due_date = DateTime::createFromFormat('Y-m-d', $due_date_str) ?: null;
  }
  if (!$due_date && $due_month) {
    // Compute from YYYY-MM and configured due_day
    $parts = explode('-', $due_month);
    if (count($parts) === 2) {
      $y = (int)$parts[0]; $m = (int)$parts[1];
      if ($y>0 && $m>=1 && $m<=12) {
        $d = min($due_day, cal_days_in_month(CAL_GREGORIAN, $m, $y));
        $due_date = DateTime::createFromFormat('Y-m-d', sprintf('%04d-%02d-%02d', $y, $m, $d));
        // Persist computed due_date for future runs
        if ($due_date) {
          $stmt = $conn->prepare("UPDATE monthly_dues SET due_date = ? WHERE id = ? AND due_date IS NULL");
          $dt = $due_date->format('Y-m-d');
          $stmt->bind_param('si', $dt, $id);
          $stmt->execute();
          $stmt->close();
          $updated++;
        }
      }
    }
  }
  if (!$due_date) { continue; }

  $g = ($row_grace !== null ? $row_grace : $grace_days);
  $overdue_start = clone $due_date; $overdue_start->modify("+{$g} day");
  if ($now <= $overdue_start) {
    // Not yet overdue; still, you may want to remind on due date itself (optional)
    continue;
  }

  // Apply late fee once when overdue
  if ((int)($row['late_fee_applied'] ?? 0) === 0 && $late_val > 0) {
    $fee = ($late_type === 'percent') ? round($amount * $late_val, 2) : round($late_val, 2);
    if ($fee > 0.00) {
      // ledger
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
      $ins = $conn->prepare("INSERT INTO dues_ledger (user_id, due_id, entry_type, amount, note) VALUES (?,?,?,?,?)");
      $etype='late_fee'; $note='5% late payment penalty';
      $ins->bind_param('sisss', $user_id, $id, $etype, $fee, $note);
      $ins->execute(); $ins->close();
      // mark applied
      $u = $conn->prepare("UPDATE monthly_dues SET late_fee_applied = 1 WHERE id = ?");
      $u->bind_param('i', $id); $u->execute(); $u->close();
    }
  }

  if ($rcount >= $rem_max) { continue; }
  if ($last_at) {
    $last = new DateTime($last_at);
    $next_allowed = clone $last; $next_allowed->modify("+{$rem_int} day");
    if ($now < $next_allowed) { continue; }
  }

  // Insert notification
  $title = 'Monthly Due Reminder';
  // Try to format month name
  $month_label = $due_month;
  if ($due_month && strlen($due_month)===7) {
    $dtm = DateTime::createFromFormat('Y-m', $due_month);
    if ($dtm) { $month_label = $dtm->format('F Y'); }
  }
  $msg = "Your monthly due for {$month_label} is overdue. Please settle as soon as possible.";
  $link = '/homeowner/dues?highlight=' . $id;

  $stmt = $conn->prepare("INSERT INTO notifications (user_id, title, message, severity, link_url) VALUES (?,?,?,?,?)");
  $sev = 'warning';
  $stmt->bind_param('sssss', $user_id, $title, $msg, $sev, $link);
  $ok = $stmt->execute();
  $stmt->close();

  if ($ok) {
    $count++;
    $stmt2 = $conn->prepare("UPDATE monthly_dues SET reminder_count = COALESCE(reminder_count,0)+1, last_reminder_at = NOW() WHERE id = ?");
    $stmt2->bind_param('i', $id);
    $stmt2->execute();
    $stmt2->close();
  }
}

$conn->close();
echo json_encode(['success'=>true, 'sent'=> $count, 'updated_due_dates'=> $updated]);
?>
