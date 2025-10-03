<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$id = (int)($_POST['id'] ?? 0);
if (!$id) { echo json_encode(['success' => false, 'message' => 'Missing id']); exit; }

$stmt = $conn->prepare('DELETE FROM dues_rates WHERE id = ?');
$stmt->bind_param('i', $id);
$ok = $stmt->execute();
$stmt->close();

echo json_encode(['success' => $ok]);
$conn->close();
?>