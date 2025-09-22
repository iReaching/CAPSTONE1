<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';
$user_id = $_POST['user_id'] ?? '';

if (!$id || !$user_id) {
  echo json_encode(["success" => false, "message" => "Missing data"]);
  exit;
}

$proof_path = null;

if (isset($_FILES['payment_proof']) && $_FILES['payment_proof']['error'] === UPLOAD_ERR_OK) {
  $filename = 'proof_' . bin2hex(random_bytes(8)) . '_' . basename($_FILES['payment_proof']['name']);
$base_upload_dir = realpath(__DIR__ . '/..');
  if ($base_upload_dir === false) { $base_upload_dir = __DIR__ . '/..'; }
  $target_dir = $base_upload_dir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'payment_proofs' . DIRECTORY_SEPARATOR;
  if (!is_dir($target_dir)) { mkdir($target_dir, 0777, true); }
  $target = $target_dir . $filename;
  if (move_uploaded_file($_FILES['payment_proof']['tmp_name'], $target)) {
    $proof_path = 'uploads/payment_proofs/' . $filename; // store relative path
  }
}

if ($proof_path) {
  $stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 1, payment_proof_path = ? WHERE id = ?");
  $stmt->bind_param("si", $proof_path, $id);
} else {
  $stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 1 WHERE id = ?");
  $stmt->bind_param("i", $id);
}

if ($stmt->execute()) {
  logAction($user_id, 'update', "Requested payment confirmation for due ID $id", basename(__FILE__));
  echo json_encode(["success" => true, "message" => "Payment request sent to admin"]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
