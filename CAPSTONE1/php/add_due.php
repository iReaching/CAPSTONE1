<?php
include 'db_connect.php';
include 'log_action.php';

include 'cors.php';
header("Content-Type: application/json");

$user_id = $_POST['user_id'] ?? '';
$amount_due = $_POST['amount_due'] ?? '';
$due_month = $_POST['due_month'] ?? '';
$rate_id = $_POST['rate_id'] ?? null; // optional, links to dues_rates.id
$payment_method = 'GCASH'; // enforced per requirements

if (!$user_id || !$amount_due || !$due_month) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

// Insert with or without rate_id depending on availability to avoid NULL bind issues
if ($rate_id === null || $rate_id === '') {
  $stmt = $conn->prepare("INSERT INTO monthly_dues (user_id, amount_due, due_month, payment_method) VALUES (?, ?, ?, ?)");
  $stmt->bind_param("sdss", $user_id, $amount_due, $due_month, $payment_method);
} else {
  $rate_id = (int)$rate_id;
  $stmt = $conn->prepare("INSERT INTO monthly_dues (user_id, amount_due, due_month, rate_id, payment_method) VALUES (?, ?, ?, ?, ?)");
  $stmt->bind_param("sisds", $user_id, $amount_due, $due_month, $rate_id, $payment_method);
}

$conn->begin_transaction();
try {
  if (!$stmt->execute()) { throw new Exception($stmt->error ?: 'Insert failed'); }
  logAction($user_id, 'insert', "Added monthly due for $due_month", basename(__FILE__));
  // Insert ledger charge safely with FK present
  $new_id = (int)$conn->insert_id;
  if ($new_id <= 0) { throw new Exception('Insert failed (no ID)'); }

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
  $etype='charge'; $note='Monthly due charge';
  $amt = (float)$amount_due;
  $ins->bind_param('sisss', $user_id, $new_id, $etype, $amt, $note);
  if (!$ins->execute() || $ins->affected_rows !== 1) { throw new Exception('Failed to add ledger charge'); }
  $ins->close();
  $conn->commit();
  echo json_encode(["success" => true]);
} catch (Exception $e) {
  $conn->rollback();
  // Duplicate month friendly message
  if (strpos(strtolower($e->getMessage()), 'duplicate') !== false) {
    echo json_encode(["success" => false, "message" => "A due for this month already exists for this user."]); 
  } else {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
  }
}

$stmt->close();
$conn->close();
?>
