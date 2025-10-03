<?php
// db_connect.php
// Auto-switch between localhost (XAMPP) and production credentials.
// - Localhost default: user "root" with no password
// - Production: define via environment variables if available, else keep the existing defaults here

// Helpful in development to see issues early
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$serverHost = $_SERVER['HTTP_HOST'] ?? 'localhost';
$serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';
$hostHeader = strtolower($serverHost . ' ' . $serverName);

$isLocal = (
    strpos($hostHeader, 'localhost') !== false ||
    strpos($hostHeader, '127.0.0.1') !== false
);

if ($isLocal) {
    // XAMPP default
    $db_host = '127.0.0.1';
    $db_user = 'root';
    $db_pass = '';
    // Adjust this if your local DB name is different
    $db_name = getenv('LOCAL_DB_NAME') ?: 'vilman_db';
} else {
    // Production (condolink.click on z.com)
    // Use environment variables if provided, otherwise fall back to known credentials
    $db_host = getenv('DB_HOST') ?: 'localhost';
    $db_user = getenv('DB_USER') ?: 'lxmgrjdj_vilman';
    $db_pass = getenv('DB_PASS') ?: 'vilmandb123';
    $db_name = getenv('DB_NAME') ?: 'lxmgrjdj_vilman_db';
}

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
// Ensure UTF-8 everywhere
if (method_exists($conn, 'set_charset')) {
    $conn->set_charset('utf8mb4');
}
?>
