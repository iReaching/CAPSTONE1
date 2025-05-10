<?php
include 'db_connect.php';
include 'log_action.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_POST['user_id'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'homeowner';
    $is_admin = isset($_POST['is_admin']) ? intval($_POST['is_admin']) : 0;

    if (!$user_id || !$email || !$password || !$role) {
        echo json_encode(["success" => false, "message" => "Missing required fields."]);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Check for duplicates
    $check = $conn->prepare("SELECT id FROM users WHERE user_id = ? OR email = ?");
    $check->bind_param("ss", $user_id, $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "User ID or email already exists."]);
        exit;
    }

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (user_id, email, password, role, is_admin) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $user_id, $email, $hashed_password, $role, $is_admin);

    if ($stmt->execute()) {
        $conn->query("INSERT INTO user_profiles (user_id, full_name, contact_number, profile_pic) VALUES ('$user_id', '', '', '')");

        logAction($user_id, 'insert', "New account created for role: $role", 'register_user.php');

        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error while registering."]);
    }

    $stmt->close();
    $check->close();
    $conn->close();
}
