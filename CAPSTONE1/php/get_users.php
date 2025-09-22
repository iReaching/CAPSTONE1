<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'cors.php';
header("Content-Type: application/json");
include 'db_connect.php';

$search = $_GET['search'] ?? '';
$role = $_GET['role'] ?? '';

$sql = "SELECT 
            u.user_id, u.role, u.email, u.is_admin,
            up.full_name, up.contact_number, up.profile_pic
        FROM users u
        LEFT JOIN user_profiles up ON u.user_id = up.user_id";

$conditions = [];
$params = [];

if (!empty($search)) {
    $conditions[] = "(up.full_name LIKE ? OR u.email LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if (!empty($role)) {
    $conditions[] = "u.role = ?";
    $params[] = $role;
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

$stmt = $conn->prepare($sql);
if ($params) {
    $types = str_repeat("s", count($params));
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode($users);
?>
