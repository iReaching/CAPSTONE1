<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_auth();

$user_id = $_POST['user_id'] ?? current_user_id();
$amount = isset($_POST['amount']) ? floatval($_POST['amount']) : 0;
if (!$user_id || $amount <= 0) { echo json_encode(['success'=>false,'message'=>'Invalid amount']); exit; }

// Store as a pending advance payment request (requires admin approval)
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

$proof_rel = null;
if (isset($_FILES['proof']) && $_FILES['proof']['error'] === UPLOAD_ERR_OK) {
  $dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'payment_proofs' . DIRECTORY_SEPARATOR;
  if (!is_dir($dir)) { mkdir($dir, 0777, true); }
  $filename = 'adv_' . bin2hex(random_bytes(8)) . '_' . basename($_FILES['proof']['name']);
  $dest = $dir . $filename;
  if (move_uploaded_file($_FILES['proof']['tmp_name'], $dest)) {
    $proof_rel = 'php/uploads/payment_proofs/' . $filename;
  }
}

$stmt = $conn->prepare("INSERT INTO advance_payments (user_id, amount, proof_path, note) VALUES (?,?,?,?)");
$note = 'Advance payment request';
$stmt->bind_param('sdss', $user_id, $amount, $proof_rel, $note);
$ok = $stmt->execute();
$id = $conn->insert_id;
$stmt->close();

echo json_encode(['success'=>$ok, 'id'=>$id]);
$conn->close();
?>
