<?php
include 'db_connect.php';
include 'log_action.php';

include 'cors.php';
header("Content-Type: application/json");

$title = $_POST['title'] ?? '';
$content = $_POST['body'] ?? '';  // 'body' from frontend becomes 'content' in DB
$posted_by = $_POST['user_id'] ?? '';
$audience = $_POST['audience'] ?? 'all';
$is_pinned = isset($_POST['is_pinned']) ? (int)$_POST['is_pinned'] : 0;

// Ensure columns exist
$conn->query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL");
$conn->query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS is_pinned TINYINT(1) DEFAULT 0");
$conn->query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS audience ENUM('all','homeowner','admin','staff','guard') DEFAULT 'all'");

if (!$title || !$content || !$posted_by) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

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

$stmt = $conn->prepare("INSERT INTO announcements (title, content, posted_by, date_posted, image_path, is_pinned, audience) VALUES (?, ?, ?, NOW(), ?, ?, ?)");
$stmt->bind_param("ssssis", $title, $content, $posted_by, $image_path, $is_pinned, $audience);

if ($stmt->execute()) {
logAction($posted_by, 'insert', "Posted new announcement: $title", basename(__FILE__));
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
