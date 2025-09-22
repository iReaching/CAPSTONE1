<?php
include 'cors.php';
header('Content-Type: application/json');

// Simple test endpoint to verify CORS is working
$response = [
    'success' => true,
    'message' => 'CORS is working correctly!',
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
    'headers' => [
        'Access-Control-Allow-Origin' => $_SERVER['HTTP_ORIGIN'] ?? 'none',
        'Access-Control-Allow-Credentials' => 'true',
        'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-CSRF-Token'
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>