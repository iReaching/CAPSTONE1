<?php
include 'db_connect.php';
include 'cors.php';
header('Content-Type: application/json');

// Create table if not exists
$conn->query("CREATE TABLE IF NOT EXISTS dues_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(64) NOT NULL,
  sqm DECIMAL(6,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Seed defaults if table empty
$check = $conn->query("SELECT COUNT(*) AS c FROM dues_rates")->fetch_assoc();
if ((int)$check['c'] === 0) {
  $conn->query("INSERT INTO dues_rates (label, sqm, amount) VALUES
    ('Studio (22.3 sqm)', 22.30, 100.00),
    ('1BR (28.5 sqm)', 28.50, 200.00),
    ('Deluxe (31.0 sqm)', 31.00, 300.00)");
}

$res = $conn->query("SELECT id, label, sqm, amount FROM dues_rates ORDER BY sqm ASC");
$rows = [];
while ($row = $res->fetch_assoc()) { $rows[] = $row; }

echo json_encode($rows);
$conn->close();
