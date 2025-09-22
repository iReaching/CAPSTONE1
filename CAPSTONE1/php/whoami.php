<?php
include 'cors.php';
include 'check_auth.php';
header('Content-Type: application/json');

// Do not require auth; report current session state safely
$response = [
  'authenticated' => is_authenticated(),
  'user_id' => current_user_id(),
  'role' => current_role(),
];

echo json_encode($response);
