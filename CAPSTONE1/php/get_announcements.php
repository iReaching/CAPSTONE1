<?php
// Surface fatal errors as JSON so we don't get a blank page
error_reporting(E_ALL);
ini_set('display_errors', 0);
register_shutdown_function(function() {
  $e = error_get_last();
  if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
    if (!headers_sent()) {
      header('Content-Type: application/json');
      http_response_code(500);
    }
    echo json_encode(['success' => false, 'fatal' => $e['message'], 'file' => $e['file'], 'line' => $e['line']]);
  }
});

include 'db_connect.php';
include 'cors.php';
header("Content-Type: application/json");

// Ensure image column exists (pin/audience removed from UI; keep harmless if present)
$conn->query("ALTER TABLE announcements ADD COLUMN IF NOT EXISTS image_path VARCHAR(255) NULL");

$sql = "
  SELECT 
    a.id,
    a.title AS subject,
    a.content,
    a.date_posted,
    a.posted_by,
    a.image_path,
    up.full_name AS poster_name,
    up.profile_pic AS poster_profile_pic
  FROM announcements a
  LEFT JOIN user_profiles up ON up.user_id = a.posted_by
  ORDER BY a.date_posted DESC
";

$result = $conn->query($sql);
if (!$result) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => $conn->error]);
  $conn->close();
  exit;
}

$announcements = [];
while ($row = $result->fetch_assoc()) {
  // Normalize encoding to UTF-8 to avoid json_encode empty output
  foreach ($row as $k => $v) {
    if (is_string($v)) {
      $row[$k] = mb_convert_encoding($v, 'UTF-8', 'UTF-8, ISO-8859-1, ISO-8859-15, Windows-1252');
    }
  }
  $announcements[] = $row;
}

$payload = json_encode($announcements, JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR | JSON_INVALID_UTF8_SUBSTITUTE);
if ($payload === false) {
  http_response_code(500);
  echo json_encode(["success" => false, "message" => "Failed to encode announcements as JSON."]);
} else {
  echo $payload;
}
$conn->close();
?>
