<?php
include '../PHP/db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$user_id = $_POST['user_id'];
$full_name = $_POST['full_name'];
$contact_number = $_POST['contact_number'];

$targetDir = "../uploads/";
$profile_pic = null;

// Handle profile_pic upload if available
if (!empty($_FILES["profile_pic"]["name"])) {
    $fileName = uniqid() . "_" . basename($_FILES["profile_pic"]["name"]);
    $targetFilePath = $targetDir . $fileName;

    if (move_uploaded_file($_FILES["profile_pic"]["tmp_name"], $targetFilePath)) {
        $profile_pic = "uploads/" . $fileName;
    }
}

// Build the SQL query
$sql = "UPDATE user_profiles SET 
            full_name = ?,
            contact_number = ?" .
            ($profile_pic ? ", profile_pic = ?" : "") .
        " WHERE user_id = ?";

// Prepare the statement
$stmt = $conn->prepare($sql);

if ($profile_pic) {
    $stmt->bind_param("ssss", $full_name, $contact_number, $profile_pic, $user_id);
} else {
    $stmt->bind_param("sss", $full_name, $contact_number, $user_id);
}

// Execute and return response
if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$conn->close();
?>
