<?php
include 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$sql = "
    SELECT u.user_id, up.full_name
    FROM users u
    JOIN user_profiles up ON u.user_id = up.user_id
    WHERE u.role = 'homeowner'
";

$result = $conn->query($sql);
$homeowners = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $homeowners[] = $row;
    }
}

echo json_encode($homeowners);
$conn->close();
?>
