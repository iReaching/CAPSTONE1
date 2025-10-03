<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$label = trim($_POST['label'] ?? '');
$sqm = $_POST['sqm'] ?? '';
$amount = $_POST['amount'] ?? '';

if ($label === '' || $sqm === '' || $amount === '') {
  echo json_encode(['success' => false, 'message' => 'Missing fields']);
  exit;
}

$stmt = $conn->prepare('INSERT INTO dues_rates (label, sqm, amount) VALUES (?, ?, ?)');
$stmt->bind_param('sdd', $label, $sqm, $amount);
$ok = $stmt->execute();
$stmt->close();

echo json_encode(['success' => $ok]);
$conn->close();
?>