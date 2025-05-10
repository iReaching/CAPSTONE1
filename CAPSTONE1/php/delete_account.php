<?php
include 'db_connect.php';
include 'log_action.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'];

    $stmt1 = $conn->prepare("DELETE FROM user_profiles WHERE user_id = ?");
    $stmt1->bind_param("s", $user_id);
    $stmt1->execute();

    $stmt2 = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt2->bind_param("s", $user_id);

    if ($stmt2->execute()) {
        logAction($user_id, 'delete', "Deleted user account: $user_id", basename(__FILE__));
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => $stmt2->error]);
    }

    $stmt1->close();
    $stmt2->close();
    $conn->close();
}

?>
