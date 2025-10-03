<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$id = (int)($_POST['id'] ?? 0);
$label = trim($_POST['label'] ?? '');
$sqm = $_POST['sqm'] ?? '';
$amount = $_POST['amount'] ?? '';

if (!$id || $label === '' || $sqm === '' || $amount === '') {
  echo json_encode(['success' => false, 'message' => 'Missing fields']);
  exit;
}

$stmt = $conn->prepare('UPDATE dues_rates SET label = ?, sqm = ?, amount = ? WHERE id = ?');
$stmt->bind_param('sddi', $label, $sqm, $amount, $id);
$ok = $stmt->execute();
$stmt->close();

echo json_encode(['success' => $ok]);
$conn->close();
?>