<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST["user_id"];
    $password = $_POST["password"];

    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($user = $result->fetch_assoc()) {
        if (password_verify($password, $user['password'])) {
            logAction($user["user_id"], 'login', 'User logged in successfully', 'login.php');
            echo json_encode([
                "success" => true,
                "user_id" => $user["user_id"],
                "role" => $user["role"],
                "is_admin" => $user["is_admin"]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Incorrect password."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "User ID not found."]);
    }

    $stmt->close();
    $conn->close();
}

?>
