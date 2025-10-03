<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amenity_id = $_POST['amenity_id'] ?? '';
    $homeowner_id = $_POST['homeowner_id'] ?? '';
    $house_id = $_POST['house_id'] ?? '';
    $request_date = $_POST['request_date'] ?? '';
    $message = $_POST['message'] ?? '';
    $time_start = $_POST['time_start'] ?? '';
    $time_end = $_POST['time_end'] ?? '';

    // If house/unit id not provided, try to derive from account profile (unit_id in user_profiles)
    if (!$house_id && $homeowner_id) {
        $q = $conn->prepare("SHOW COLUMNS FROM user_profiles LIKE 'unit_id'");
        $q->execute(); $exists = $q->get_result()->num_rows > 0; $q->close();
        if ($exists) {
            $s = $conn->prepare("SELECT unit_id FROM user_profiles WHERE user_id = ?");
            $s->bind_param('s', $homeowner_id); $s->execute(); $r = $s->get_result()->fetch_assoc(); $s->close();
            if ($r && !empty($r['unit_id'])) { $house_id = $r['unit_id']; }
        }
    }

    if (!$amenity_id || !$homeowner_id || !$request_date || !$time_start || !$time_end) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO amenity_schedule (amenity_id, homeowner_id, house_id, request_date, message, time_start, time_end, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("sssssss", $amenity_id, $homeowner_id, $house_id, $request_date, $message, $time_start, $time_end);

    if ($stmt->execute()) {
        logAction($homeowner_id, 'insert', "Requested amenity ID $amenity_id on $request_date", 'schedule_amenity.php');
        echo json_encode(["success" => true, "message" => "Request submitted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }

    $stmt->close();
    $conn->close();
}

?>
