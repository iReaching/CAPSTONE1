<?php
include 'db_connect.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = $_GET['user_id'];

    // Fetch user data from the 'users' table
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $user_result = $stmt->get_result();
    $user = $user_result->fetch_assoc();

    // Fetch profile data from 'user_profiles' table
    $stmt = $conn->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $profile_result = $stmt->get_result();
    $profile = $profile_result->fetch_assoc();

    // Merge the data (you may want to merge it differently based on your needs)
    $response = array(
        "success" => true,
        "user_id" => $user["user_id"],
        "role" => $user["role"],
        "email" => $user["email"],
        "profile_picture" => $profile["profile_picture"] ?? "https://ui-avatars.com/api/?name=" . $user["user_id"],
        "full_name" => $profile["full_name"] ?? '',
        "contact_number" => $profile["contact_number"] ?? ''
    );

    echo json_encode($response);
    
    $stmt->close();
    $conn->close();
}
?>
