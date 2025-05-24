<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$title = $_POST['title'] ?? '';
$content = $_POST['body'] ?? '';  // 'body' from frontend becomes 'content' in DB
$posted_by = $_POST['user_id'] ?? '';

if (!$title || !$content || !$posted_by) {
  echo json_encode(["success" => false, "message" => "Missing required fields"]);
  exit;
}

$stmt = $conn->prepare("INSERT INTO announcements (title, content, posted_by, date_posted) VALUES (?, ?, ?, NOW())");
$stmt->bind_param("sss", $title, $content, $posted_by);

if ($stmt->execute()) {
logAction($posted_by, 'insert', "Posted new announcement: $title", basename(__FILE__));
  echo json_encode(["success" => true]);
} else {
  echo json_encode(["success" => false, "message" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
