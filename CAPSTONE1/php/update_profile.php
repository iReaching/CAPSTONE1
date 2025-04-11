<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include '../PHP/db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

$user_id = $_POST['user_id'];
$full_name = $_POST['full_name'];
$contact_number = $_POST['contact_number'];

$uploadDir = "../uploads/";
$profile_pic = null;

// Ensure the uploads folder exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Handle profile picture upload
if (!empty($_FILES["profile_pic"]["name"])) {
    $fileName = uniqid() . "_" . basename($_FILES["profile_pic"]["name"]);
    $targetFilePath = $uploadDir . $fileName;

    if (move_uploaded_file($_FILES["profile_pic"]["tmp_name"], $targetFilePath)) {
        $profile_pic = "uploads/" . $fileName; // Save relative path to DB
    } else {
        echo json_encode(["success" => false, "error" => "File upload failed"]);
        exit;
    }
}

// Build SQL depending on whether image was uploaded
if ($profile_pic) {
    $sql = "UPDATE user_profiles SET full_name = ?, contact_number = ?, profile_pic = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $full_name, $contact_number, $profile_pic, $user_id);
} else {
    $sql = "UPDATE user_profiles SET full_name = ?, contact_number = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $full_name, $contact_number, $user_id);
}

// Execute
if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
