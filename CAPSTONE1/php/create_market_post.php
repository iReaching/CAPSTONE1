<?php
include 'db_connect.php';
include 'check_auth.php';
include 'cors.php';
header('Content-Type: application/json');

require_auth();
$role = current_role();
if ($role !== 'homeowner' && $role !== 'tenant' && $role !== 'homeowner') {
  // Allow homeowners (tenants) to post. Some systems use 'homeowner' as tenant.
}

// Ensure tables exist
$conn->query("CREATE TABLE IF NOT EXISTS market_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  category ENUM('for_sale','for_rent') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price DECIMAL(10,2) NULL,
  image_path VARCHAR(255) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL,
  approved_by VARCHAR(64) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS market_post_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_post (post_id),
  CONSTRAINT fk_market_image_post FOREIGN KEY (post_id) REFERENCES market_posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed']);
  exit;
}

$user_id = current_user_id();
$category = $_POST['category'] ?? '';
$title = trim($_POST['title'] ?? '');
$description = trim($_POST['description'] ?? '');
$price = isset($_POST['price']) && $_POST['price'] !== '' ? floatval($_POST['price']) : null;
$image_path = null;
$gallery = [];

// Helper to save a file and return relative path
function save_market_image($file) {
  $allowed = ['image/jpeg','image/png','image/gif','image/webp'];
  $tmp = $file['tmp_name'] ?? null;
  if (!$tmp || !file_exists($tmp)) return null;
  $mime = mime_content_type($tmp);
  if (!in_array($mime, $allowed, true)) return null;
  $ext = pathinfo($file['name'] ?? 'jpg', PATHINFO_EXTENSION);
  $filename = 'market_' . bin2hex(random_bytes(8)) . '.' . strtolower($ext ?: 'jpg');
  $base = realpath(__DIR__ . '/..'); if ($base === false) { $base = __DIR__ . '/..'; }
  $dir = $base . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'market' . DIRECTORY_SEPARATOR;
  if (!is_dir($dir)) { mkdir($dir, 0777, true); }
  $dest = $dir . $filename;
  if (move_uploaded_file($tmp, $dest)) {
    return 'uploads/market/' . $filename;
  }
  return null;
}

// Single image (backward compatible)
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
  $p = save_market_image($_FILES['image']);
  if ($p) { $image_path = $p; $gallery[] = $p; }
}

// Multiple images (images[])
if (isset($_FILES['images']) && is_array($_FILES['images']['name'])) {
  $count = count($_FILES['images']['name']);
  for ($i=0; $i<$count; $i++) {
    if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
      $file = [
        'name' => $_FILES['images']['name'][$i],
        'type' => $_FILES['images']['type'][$i],
        'tmp_name' => $_FILES['images']['tmp_name'][$i],
        'error' => $_FILES['images']['error'][$i],
        'size' => $_FILES['images']['size'][$i],
      ];
      $p = save_market_image($file);
      if ($p) $gallery[] = $p;
    }
  }
  if (!$image_path && count($gallery)>0) { $image_path = $gallery[0]; }
}

if (!$user_id || !$category || !$title) {
  echo json_encode(['success' => false, 'message' => 'Missing required fields']);
  exit;
}

if (!in_array($category, ['for_sale','for_rent'], true)) {
  echo json_encode(['success' => false, 'message' => 'Invalid category']);
  exit;
}

// Build dynamic insert with optional price and image_path
if ($price === null && $image_path === null) {
  $stmt = $conn->prepare("INSERT INTO market_posts (user_id, category, title, description, price, image_path, status) VALUES (?,?,?,?,NULL,NULL,'pending')");
  $stmt->bind_param('ssss', $user_id, $category, $title, $description);
} elseif ($price === null && $image_path !== null) {
  $stmt = $conn->prepare("INSERT INTO market_posts (user_id, category, title, description, price, image_path, status) VALUES (?,?,?,?,NULL,?,'pending')");
  $stmt->bind_param('sssss', $user_id, $category, $title, $description, $image_path);
} elseif ($price !== null && $image_path === null) {
  $stmt = $conn->prepare("INSERT INTO market_posts (user_id, category, title, description, price, image_path, status) VALUES (?,?,?,?,?,NULL,'pending')");
  $stmt->bind_param('ssssd', $user_id, $category, $title, $description, $price);
} else {
  $stmt = $conn->prepare("INSERT INTO market_posts (user_id, category, title, description, price, image_path, status) VALUES (?,?,?,?,?,?, 'pending')");
  $stmt->bind_param('ssssds', $user_id, $category, $title, $description, $price, $image_path);
}

if ($stmt->execute()) {
  $post_id = $conn->insert_id;
  // Insert gallery images
  if (count($gallery)>0) {
    $order = 0;
    foreach ($gallery as $p) {
      $ins = $conn->prepare("INSERT INTO market_post_images (post_id, image_path, sort_order) VALUES (?,?,?)");
      $ins->bind_param('isi', $post_id, $p, $order);
      $ins->execute();
      $ins->close();
      $order++;
    }
  }
  echo json_encode(['success' => true, 'message' => 'Post submitted for approval']);
} else {
  echo json_encode(['success' => false, 'message' => $stmt->error]);
}
$stmt->close();
$conn->close();
