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
  // Save under php/uploads to keep a single canonical location
  $base_upload_dir = __DIR__;
  $target_dir = $base_upload_dir . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'payment_proofs' . DIRECTORY_SEPARATOR;
  if (!is_dir($target_dir)) { mkdir($target_dir, 0777, true); }
  $target = $target_dir . $filename;
  if (move_uploaded_file($_FILES['payment_proof']['tmp_name'], $target)) {
    $proof_path = 'php/uploads/payment_proofs/' . $filename; // store relative path including php/
  }
}

// GCASH metadata (optional)
$gcash_ref = $_POST['gcash_reference'] ?? null;
$gcash_name = $_POST['gcash_sender_name'] ?? null;
$gcash_mobile = $_POST['gcash_sender_mobile'] ?? null;
$gcash_amount = isset($_POST['gcash_amount']) && $_POST['gcash_amount'] !== '' ? floatval($_POST['gcash_amount']) : null;

if ($proof_path) {
  if ($gcash_amount !== null) {
    $stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 1, payment_proof_path = ?, gcash_reference = ?, gcash_sender_name = ?, gcash_sender_mobile = ?, gcash_amount = ? WHERE id = ?");
    $stmt->bind_param("ssssid", $proof_path, $gcash_ref, $gcash_name, $gcash_mobile, $gcash_amount, $id);
  } else {
    $stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 1, payment_proof_path = ?, gcash_reference = ?, gcash_sender_name = ?, gcash_sender_mobile = ? WHERE id = ?");
    $stmt->bind_param("ssssi", $proof_path, $gcash_ref, $gcash_name, $gcash_mobile, $id);
  }
} else {
  if ($gcash_amount !== null) {
    $stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 1, gcash_reference = ?, gcash_sender_name = ?, gcash_sender_mobile = ?, gcash_amount = ? WHERE id = ?");
    $stmt->bind_param("sssdi", $gcash_ref, $gcash_name, $gcash_mobile, $gcash_amount, $id);
  } else {
    $stmt = $conn->prepare("UPDATE monthly_dues SET payment_requested = 1, gcash_reference = ?, gcash_sender_name = ?, gcash_sender_mobile = ? WHERE id = ?");
    $stmt->bind_param("sssi", $gcash_ref, $gcash_name, $gcash_mobile, $id);
  }
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
