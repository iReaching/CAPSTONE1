<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

if (!isset($_FILES['qr'])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Missing file field: qr']);
  exit;
}

$upload_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'settings' . DIRECTORY_SEPARATOR;
if (!is_dir($upload_dir)) { mkdir($upload_dir, 0777, true); }

$file = $_FILES['qr'];
if ($file['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Upload error']);
  exit;
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);
$allowed = [ 'image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp' ];
if (!isset($allowed[$mime])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => 'Invalid image type']);
  exit;
}

$ext = $allowed[$mime];
$filename = 'gcash_qr_' . bin2hex(random_bytes(8)) . '.' . $ext;
$target = $upload_dir . $filename;
if (!move_uploaded_file($file['tmp_name'], $target)) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => 'Failed to save file']);
  exit;
}

$relative_url = 'uploads/settings/' . $filename;

// Save to app_settings
$conn->query("CREATE TABLE IF NOT EXISTS app_settings (`key` VARCHAR(64) PRIMARY KEY, `value` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
$stmt = $conn->prepare('REPLACE INTO app_settings (`key`,`value`) VALUES ("gcash_qr_url", ?)');
$stmt->bind_param('s', $relative_url);
$stmt->execute();
$stmt->close();

echo json_encode(['success' => true, 'url' => $relative_url]);
$conn->close();
?>