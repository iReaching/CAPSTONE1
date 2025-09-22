<?php
$host = "localhost";              // Update if z.com gives a different DB host
$username = "lxmgrjdj_vilman";    // z.com DB username
$password = "vilmandb123";        // z.com DB password
$database = "vilman_db";          // change if your DB name differs on z.com

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (method_exists($conn, 'set_charset')) {
    $conn->set_charset('utf8mb4');
}
?>
