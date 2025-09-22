<?php
include 'db_connect.php';
include 'log_action.php';
include 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $item_id = $_POST['item_id'] ?? '';
    $homeowner_id = $_POST['user_id'] ?? '';
    $request_date = $_POST['request_date'] ?? '';
    $time_start = $_POST['time_start'] ?? '';
    $time_end = $_POST['time_end'] ?? '';
    $message = $_POST['message'] ?? '';

    if (!$item_id || !$homeowner_id || !$request_date || !$time_start || !$time_end) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO item_schedule 
        (item_id, homeowner_id, request_date, time_start, time_end, message, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending')");
    $stmt->bind_param("ssssss", $item_id, $homeowner_id, $request_date, $time_start, $time_end, $message);

    if ($stmt->execute()) {
        // ✅ Log this insertion
        $description = "Homeowner requested to borrow item ID $item_id from $time_start to $time_end on $request_date.";
        logAction($homeowner_id, 'insert', $description, basename(__FILE__));

        echo json_encode(["success" => true, "message" => "Item borrowing request submitted."]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }

    $stmt->close();
    $conn->close();
}
?>
