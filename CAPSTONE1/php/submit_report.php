<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $message = $_POST['message'] ?? '';
    $block = $_POST['block'] ?? '';
    $lot = $_POST['lot'] ?? '';
    $date_submitted = date("Y-m-d");

    if (empty($user_id) || empty($message) || empty($block) || empty($lot)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO maintenance_reports (user_id, message, block, lot, date_submitted, status) VALUES (?, ?, ?, ?, ?, 'ongoing')");
    $stmt->bind_param("sssss", $user_id, $message, $block, $lot, $date_submitted);

    if ($stmt->execute()) {
        logAction($user_id, 'insert', "Submitted report for Block $block, Lot $lot", 'submit_report.php');
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error."]);
    }

    $stmt->close();
    $conn->close();
}
?>
