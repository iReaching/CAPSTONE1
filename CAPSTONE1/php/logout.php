<?php
include 'check_auth.php';
include 'cors.php';
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) { session_start(); }

$_SESSION = [];
session_unset();
session_destroy();

echo json_encode(['success' => true]);
