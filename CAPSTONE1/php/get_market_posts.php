<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

// Ensure table exists (safe no-op if already present)
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

$status = $_GET['status'] ?? 'approved';
$allowed = ['approved','pending','rejected'];
if (!in_array($status, $allowed, true)) { $status = 'approved'; }

// Join to get poster name if available
$sql = "SELECT mp.*, up.full_name AS poster_name
        FROM market_posts mp
        LEFT JOIN user_profiles up ON up.user_id = mp.user_id
        WHERE mp.status = ?
        ORDER BY mp.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $status);
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
$postIds = [];
while ($row = $res->fetch_assoc()) { $rows[] = $row; $postIds[] = (int)$row['id']; }

// Load gallery images if any
if (count($postIds)>0) {
  $in = implode(',', array_fill(0, count($postIds), '?'));
  $types = str_repeat('i', count($postIds));
  $stmt2 = $conn->prepare("SELECT id, post_id, image_path, sort_order FROM market_post_images WHERE post_id IN ($in) ORDER BY sort_order, id");
  $stmt2->bind_param($types, ...$postIds);
  $stmt2->execute();
  $r2 = $stmt2->get_result();
  $imagesByPost = [];
  while ($r = $r2->fetch_assoc()) { $imagesByPost[$r['post_id']][] = ['id'=>(int)$r['id'], 'path'=>$r['image_path'], 'sort_order'=>(int)$r['sort_order']]; }
  $stmt2->close();
  // Attach
  foreach ($rows as &$row) {
    $row['images'] = $imagesByPost[$row['id']] ?? [];
  }
}

echo json_encode($rows);
$stmt->close();
$conn->close();
