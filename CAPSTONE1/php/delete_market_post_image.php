<?php
include 'db_connect.php';
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

require_role(['admin']);

$id = $_POST['id'] ?? '';
if (!$id) { echo json_encode(['success'=>false,'message'=>'Missing image id']); exit; }

// Find image
$stmt = $conn->prepare("SELECT mpi.id, mpi.post_id, mpi.image_path, mp.image_path AS cover FROM market_post_images mpi JOIN market_posts mp ON mp.id = mpi.post_id WHERE mpi.id = ?");
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$stmt->close();

if (!$row) { echo json_encode(['success'=>false,'message'=>'Not found']); $conn->close(); exit; }
$post_id = (int)$row['post_id'];
$path = $row['image_path'];
$cover = $row['cover'];

// Delete row
$del = $conn->prepare("DELETE FROM market_post_images WHERE id = ?");
$del->bind_param('i', $id);
$ok = $del->execute();
$del->close();

if (!$ok) { echo json_encode(['success'=>false,'message'=>'Failed to delete']); $conn->close(); exit; }

// Update cover if needed
if ($cover === $path) {
  $q = $conn->prepare("SELECT image_path FROM market_post_images WHERE post_id = ? ORDER BY sort_order, id LIMIT 1");
  $q->bind_param('i', $post_id);
  $q->execute();
  $r = $q->get_result();
  $next = $r->fetch_assoc();
  $q->close();
  $newCover = $next ? $next['image_path'] : NULL;
  if ($newCover) {
    $u = $conn->prepare("UPDATE market_posts SET image_path = ? WHERE id = ?");
    $u->bind_param('si', $newCover, $post_id);
    $u->execute();
    $u->close();
  } else {
    $u = $conn->prepare("UPDATE market_posts SET image_path = NULL WHERE id = ?");
    $u->bind_param('i', $post_id);
    $u->execute();
    $u->close();
  }
}

// Try to remove file (optional)
try {
  $abs = realpath(__DIR__ . '/..'); if ($abs === false) { $abs = __DIR__ . '/..'; }
  $file = $abs . DIRECTORY_SEPARATOR . $path;
  if (is_file($file)) { @unlink($file); }
} catch (Exception $e) {}

echo json_encode(['success'=>true]);
$conn->close();
?>
