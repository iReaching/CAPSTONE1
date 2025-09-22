<?php
include 'cors.php';
include 'db_connect.php';
header('Content-Type: application/json');

$health = [
  'status' => 'ok',
  'time' => gmdate('c'),
  'php_version' => PHP_VERSION,
  'db_ok' => false,
];

try {
  $result = $conn->query('SELECT 1');
  if ($result) { $health['db_ok'] = true; }
} catch (Throwable $e) {
  $health['db_ok'] = false;
}

echo json_encode($health);
$conn->close();
