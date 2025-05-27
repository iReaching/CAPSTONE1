<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");
include 'db_connect.php';

$user_id = $_GET['user_id'] ?? '';

if (!$user_id) {
    echo json_encode(["error" => "Missing user_id"]);
    exit;
}

$response = [
    "profile" => null,
    "vehicles" => [],
    "activity" => [
        "amenity_requests" => 0,
        "item_requests" => 0,
        "reports" => 0,
        "entry_logs" => 0,
    ]
];

// Get profile info
$profile_sql = "SELECT u.user_id, u.email, u.role, up.full_name, up.contact_number, up.profile_pic
                FROM users u
                JOIN user_profiles up ON u.user_id = up.user_id
                WHERE u.user_id = ?";
$stmt = $conn->prepare($profile_sql);
$stmt->bind_param("s", $user_id);
$stmt->execute();
$profile_result = $stmt->get_result();
if ($row = $profile_result->fetch_assoc()) {
    $response["profile"] = $row;
}
$stmt->close();

// Get registered vehicles
$vehicle_sql = "SELECT id, name, color, type_of_vehicle AS type, plate_number AS plate, vehicle_pic_path, block, lot
                FROM vehicle_registrations
                WHERE user_id = ?
                ";
$stmt = $conn->prepare($vehicle_sql);
$stmt->bind_param("s", $user_id);
$stmt->execute();
$vehicle_result = $stmt->get_result();
while ($vehicle = $vehicle_result->fetch_assoc()) {
    $response["vehicles"][] = $vehicle;
}
$stmt->close();

// Count activity: amenity_schedule
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM amenity_schedule WHERE homeowner_id = ?");
$stmt->bind_param("s", $user_id);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$response["activity"]["amenity_requests"] = $count;
$stmt->close();

// Count activity: item_schedule
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM item_schedule WHERE homeowner_id = ?");
$stmt->bind_param("s", $user_id);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$response["activity"]["item_requests"] = $count;
$stmt->close();

// Count activity: maintenance_reports
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM maintenance_reports WHERE user_id = ?");
$stmt->bind_param("s", $user_id);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$response["activity"]["reports"] = $count;
$stmt->close();

// Count activity: entry_log (requested guests)
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM entry_log WHERE requested_by = ?");
$stmt->bind_param("s", $user_id);
$stmt->execute();
$stmt->bind_result($count);
$stmt->fetch();
$response["activity"]["entry_logs"] = $count;
$stmt->close();

echo json_encode($response);
$conn->close();
?>
