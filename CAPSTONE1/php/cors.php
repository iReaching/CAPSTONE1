<?php
// Unified CORS headers for all PHP endpoints
// - Allows credentials (cookies) and dynamic origin whitelisting
// - Handles OPTIONS preflight

// Determine request origin and environment
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
$host   = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : '';
$https  = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
$scheme = $https ? 'https' : 'http';

// Allowed origins (extend as needed)
$allowed_origins = [
    // Same host (XAMPP dev, production)
    $scheme . '://' . $host,
    // Vite dev server (default)
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    // Alternative Vite ports
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:4173',
    // Common dev ports
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:4173',
    // Localhost without port
    'http://localhost',
    'http://127.0.0.1',
    // HTTPS versions for production
    'https://localhost:5173',
    'https://127.0.0.1:5173',
];

if ($origin && in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    // If there's no Origin (e.g., same-origin requests) we don't need to set ACAO.
    // Avoid using '*' with credentials.
}

// Always set these for preflight/actual requests
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-CSRF-Token');
header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
header('Vary: Origin');

// Respond to CORS preflight quickly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
