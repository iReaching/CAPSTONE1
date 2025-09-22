<?php
include 'db_connect.php';
include 'log_action.php';

include 'cors.php';
header("Content-Type: application/json");

$id = $_POST['id'] ?? '';
$title = $_POST['title'] ?? '';
$content = $_POST['body'] ?? ''; // coming in as "body" from frontend
$posted_by = $_POST['user_id'] ?? ''; // used only for logging

if (!$id || !$title || !$content || !$posted_by) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

$stmt = $conn->prepare("UPDATE announcements SET title = ?, content = ? WHERE id = ?");
$stmt->bind_param("ssi", $title, $content, $id);

if ($stmt->execute()) {
  logAction($posted_by, 'update', "Updated announcement ID $id", basename(__FILE__));
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
