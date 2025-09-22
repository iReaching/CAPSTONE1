<?php
include 'db_connect.php';
include 'check_auth.php';
include 'cors.php';
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    require_auth();

    if (!isset($_GET['user_id'])) {
        echo json_encode(["success" => false, "message" => "Missing user_id"]);
        exit;
    }

    $requested_user_id = $_GET['user_id'];

    // Non-admin/staff can only view their own profile
    $role = current_role();
    if (!in_array($role, ['admin','staff'], true)) {
        if ($requested_user_id !== current_user_id()) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Forbidden"]);
            exit;
        }
    }

    // Fetch user data
    $stmt = $conn->prepare("SELECT user_id, role, email FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $requested_user_id);
    $stmt->execute();
    $user_result = $stmt->get_result();
    $user = $user_result->fetch_assoc();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    // Fetch profile data
    $stmt = $conn->prepare("SELECT full_name, contact_number, profile_pic FROM user_profiles WHERE user_id = ?");
    $stmt->bind_param("s", $requested_user_id);
    $stmt->execute();
    $profile_result = $stmt->get_result();
    $profile = $profile_result->fetch_assoc() ?: [];

    // Only return the filename if it exists, let frontend handle fallbacks
    $profile_pic_path = (isset($profile["profile_pic"]) && !empty($profile["profile_pic"])) 
        ? $profile["profile_pic"] 
        : null;

    // Merge response
    $response = array(
        "success" => true,
        "user_id" => $user["user_id"],
        "role" => $user["role"],
        "email" => $user["email"],
        "profile_picture" => $profile_pic_path,
        "full_name" => $profile["full_name"] ?? '',
        "contact_number" => $profile["contact_number"] ?? ''
    );

    echo json_encode($response);

    $stmt->close();
    $conn->close();
}
?>
