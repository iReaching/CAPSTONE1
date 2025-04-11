<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['user_id'])) {
        echo json_encode(["success" => false, "message" => "Missing user_id"]);
        exit;
    }

    $user_id = $_GET['user_id'];
    $base_url = "http://localhost/vitecap1/capstone1/";

    // Fetch user data
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->bind_param("s", $user_id); // 's' because user_id is varchar
    $stmt->execute();
    $user_result = $stmt->get_result();
    $user = $user_result->fetch_assoc();

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    // Fetch profile data
    $stmt = $conn->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
    $stmt->bind_param("s", $user_id);
    $stmt->execute();
    $profile_result = $stmt->get_result();
    $profile = $profile_result->fetch_assoc();

    $profile_pic_path = isset($profile["profile_pic"]) && $profile["profile_pic"]
        ? $base_url . $profile["profile_pic"]
        : "https://ui-avatars.com/api/?name=" . urlencode($user["user_id"]);

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
