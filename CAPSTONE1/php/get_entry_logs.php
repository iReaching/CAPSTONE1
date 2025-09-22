<?php
include 'db_connect.php';
include 'check_auth.php';
include 'cors.php';
header("Content-Type: application/json");

// Admin, staff, and guard can view entry logs
require_role(['admin','staff','guard']);

$page = isset($_GET['page']) ? intval($_GET['page']) : 1;
$search = isset($_GET['search']) ? $_GET['search'] : '';
$role = isset($_GET['role']) ? $_GET['role'] : '';
$sortField = isset($_GET['sortField']) ? $_GET['sortField'] : 'timestamp';
$sortOrder = isset($_GET['sort']) && strtoupper($_GET['sort']) === 'ASC' ? 'ASC' : 'DESC';
$from = isset($_GET['from']) ? $_GET['from'] : '';
$to = isset($_GET['to']) ? $_GET['to'] : '';

$limit = 10;
$offset = ($page - 1) * $limit;

$params = [];
$conditions = [];

$sql = "SELECT 
            e.*, 
            up.full_name AS requested_by 
        FROM entry_log e
        LEFT JOIN users u ON e.requested_by = u.user_id
        LEFT JOIN user_profiles up ON u.user_id = up.user_id";

// Search condition
if (!empty($search)) {
    $conditions[] = "(e.name LIKE ? OR e.vehicle_plate LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

// Role condition (filter by user role of the requester)
if (!empty($role)) {
    $conditions[] = "(u.role = ? OR u.role IS NULL)";
    $params[] = $role;
}

// Date range filters
if (!empty($from)) {
    $conditions[] = "e.timestamp >= ?";
    $params[] = $from . ' 00:00:00';
}
if (!empty($to)) {
    $conditions[] = "e.timestamp <= ?";
    $params[] = $to . ' 23:59:59';
}

if (count($conditions) > 0) {
    $sql .= " WHERE " . implode(" AND ", $conditions);
}

// Whitelist allowed sortable columns to prevent SQL injection
$allowedSortFields = ['timestamp', 'name', 'vehicle_plate'];
if (!in_array($sortField, $allowedSortFields, true)) {
    $sortField = 'timestamp';
}

$sql .= " ORDER BY e." . $sortField . " " . $sortOrder . " LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;

$stmt = $conn->prepare($sql);

// Dynamic binding
$bindTypes = str_repeat("s", max(0, count($params) - 2)) . "ii";
$stmt->bind_param($bindTypes, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$logs = [];
while ($row = $result->fetch_assoc()) {
    $logs[] = $row;
}
$stmt->close();

// Count total
$count_sql = "SELECT COUNT(*) as total FROM entry_log e LEFT JOIN users u ON e.requested_by = u.user_id";
if (!empty($role) || !empty($search)) {
    $count_sql .= " LEFT JOIN user_profiles up ON u.user_id = up.user_id";
}

$count_conditions = [];
$count_params = [];
if (!empty($search)) {
    $count_conditions[] = "(e.name LIKE ? OR e.vehicle_plate LIKE ?)";
    $count_params[] = "%$search%";
    $count_params[] = "%$search%";
}
if (!empty($role)) {
    $count_conditions[] = "(u.role = ? OR u.role IS NULL)";
    $count_params[] = $role;
}
if (!empty($from)) {
    $count_conditions[] = "e.timestamp >= ?";
    $count_params[] = $from . ' 00:00:00';
}
if (!empty($to)) {
    $count_conditions[] = "e.timestamp <= ?";
    $count_params[] = $to . ' 23:59:59';
}

if (count($count_conditions) > 0) {
    $count_sql .= " WHERE " . implode(" AND ", $count_conditions);
}

$count_stmt = $conn->prepare($count_sql);
if (!empty($count_params)) {
    $bindTypes2 = str_repeat("s", count($count_params));
    $count_stmt->bind_param($bindTypes2, ...$count_params);
}
$count_stmt->execute();
$count_result = $count_stmt->get_result();
$total = $count_result->fetch_assoc()['total'];
$count_stmt->close();

echo json_encode([
    "logs" => $logs,
    "total" => $total
]);

$conn->close();
?>
