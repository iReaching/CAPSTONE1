<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: application/json");
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$response = [
    "amenity_pending" => 0,
    "item_pending" => 0
];

// Count pending amenity requests
$amenity_sql = "SELECT COUNT(*) as count FROM amenity_schedule WHERE status = 'pending'";
$amenity_result = $conn->query($amenity_sql);
if ($row = $amenity_result->fetch_assoc()) {
    $response["amenity_pending"] = $row['count'];
}

// Count pending item requests
$item_sql = "SELECT COUNT(*) as count FROM item_schedule WHERE status = 'pending'";
$item_result = $conn->query($item_sql);
if ($row = $item_result->fetch_assoc()) {
    $response["item_pending"] = $row['count'];
}

// Count unresolved reports
$report_sql = "SELECT COUNT(*) as count FROM maintenance_reports WHERE status = 'pending'";
$report_result = $conn->query($report_sql);
if ($row = $report_result->fetch_assoc()) {
    $response["report_pending"] = $row['count'];
}

// Count today's guest entry logs
$today = date('Y-m-d');
$log_sql = "SELECT COUNT(*) as count FROM entry_log WHERE entry_type = 'Entry' AND DATE(CAST(timestamp AS DATETIME)) = ?";
$stmt = $conn->prepare($log_sql);
$stmt->bind_param("s", $today);
$stmt->execute();
$log_result = $stmt->get_result();
if ($row = $log_result->fetch_assoc()) {
    $response["entry_guests_today"] = $row['count'];
}
$stmt->close();

// Count total guest entries (Entry type only)
$total_sql = "SELECT COUNT(*) as count FROM entry_log WHERE entry_type = 'Entry'";
$total_result = $conn->query($total_sql);
if ($row = $total_result->fetch_assoc()) {
    $response["entry_guests_total"] = $row['count'];
}


// Count all users
$user_sql = "SELECT COUNT(*) as count FROM users";
$user_result = $conn->query($user_sql);
if ($row = $user_result->fetch_assoc()) {
    $response["total_users"] = $row['count'];
}

// Count users by role
$roles = ['admin', 'staff', 'guard', 'homeowner'];
foreach ($roles as $r) {
    $stmt = $conn->prepare("SELECT COUNT(*) as count FROM users WHERE role = ?");
    $stmt->bind_param("s", $r);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $response["count_" . $r] = $row['count'];
    }
    $stmt->close();
}

echo json_encode($response);
$conn->close();
?>
