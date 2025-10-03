<?php
include 'db_connect.php';
include 'log_action.php';

include 'cors.php';
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';
$title = $_POST['title'] ?? '';
$content = $_POST['body'] ?? ''; // coming in as "body" from frontend
$posted_by = $_POST['user_id'] ?? ''; // used only for logging
$audience = $_POST['audience'] ?? null;
$is_pinned = isset($_POST['is_pinned']) ? (int)$_POST['is_pinned'] : null;

// Ensure columns exist
$conn->query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL");
$conn->query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) DEFAULT 0");
$conn->query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS audience ENUM('all','homeowner','admin','staff','guard') DEFAULT 'all'");

if (!$id || !$title || !$content || !$posted_by) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

// Optional image upload
$image_path = null;
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
  $base = realpath(__DIR__ . '/..'); if ($base === false) { $base = __DIR__ . '/..'; }
  $dir = $base . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'announcements' . DIRECTORY_SEPARATOR;
  if (!is_dir($dir)) { mkdir($dir, 0777, true); }
  $filename = 'ann_' . bin2hex(random_bytes(8)) . '_' . basename($_FILES['image']['name']);
  $dest = $dir . $filename;
  if (move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
    $image_path = 'uploads/announcements/' . $filename;
  }
}

$set = "title = ?, content = ?";
$params = [$title, $content];
$types = 'ss';
if ($image_path !== null) { $set .= ", image_path = ?"; $params[] = $image_path; $types .= 's'; }
if ($audience !== null) { $set .= ", audience = ?"; $params[] = $audience; $types .= 's'; }
if ($is_pinned !== null) { $set .= ", is_pinned = ?"; $params[] = $is_pinned; $types .= 'i'; }
$types .= 'i'; $params[] = (int)$id;

$stmt = $conn->prepare("UPDATE announcements SET $set WHERE id = ?");
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
  logAction($posted_by, 'update', "Updated announcement ID $id", basename(__FILE__));
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
