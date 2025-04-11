<?php
$host = "localhost";       // or 127.0.0.1
$username = "root";        // default XAMPP user
$password = "";            // leave blank if no password
$database = "vilman_db";      // change this to your database name

$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
