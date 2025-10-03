<?php
include 'db_connect.php';
include 'log_action.php';
include 'check_auth.php';
include 'cors.php';
header('Content-Type: application/json');

require_role(['homeowner']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

$user_id = current_user_id();
$name = trim($_POST['vehicle_name'] ?? '');
$color = trim($_POST['vehicle_color'] ?? '');
$type = trim($_POST['vehicle_type'] ?? '');
$plate = trim($_POST['vehicle_plate'] ?? '');
$block = trim($_POST['block'] ?? '');
$lot = trim($_POST['lot'] ?? '');

if (!$user_id || !$name || !$color || !$type || !$plate || !$block || !$lot) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'All fields are required']);
  exit;
}

// Enforce single vehicle per tenant
$chk = $conn->prepare('SELECT COUNT(*) FROM vehicle_registrations WHERE user_id = ?');
$chk->bind_param('s', $user_id);
$chk->execute();
$chk->bind_result($c); $chk->fetch(); $chk->close();
if ((int)$c > 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Only one vehicle is allowed per tenant']);
  exit;
}

$stmt = $conn->prepare('INSERT INTO vehicle_registrations (user_id, name, color, type_of_vehicle, plate_number, block, lot, vehicle_pic_path) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)');
$stmt->bind_param('sssssss', $user_id, $name, $color, $type, $plate, $block, $lot);
$ok = $stmt->execute();
$id = $conn->insert_id;
$stmt->close();

if ($ok) {
  logAction($user_id, 'insert', 'Quick vehicle registration', 'quick_register_vehicle.php');
  echo json_encode(['success' => true, 'id' => $id]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Database error']);
}

$conn->close();
