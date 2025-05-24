<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';
$user_id = $_POST['user_id'] ?? '';

if (!$id || !$user_id) {
  echo json_encode(["success" => false, "message" => "Missing data"]);
  exit;
}

$proof_path = null;

if (isset($_FILES['payment_proof']) && $_FILES['payment_proof']['error'] == 0) {
  $filename = "proof_" . uniqid() . "_" . $_FILES['payment_proof']['name'];
  $target = "../uploads/payment_proofs/" . $filename;
  move_uploaded_file($_FILES['payment_proof']['tmp_name'], $target);
  $proof_path = "capstone1/uploads/payment_proofs/" . $filename;
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
