<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'db_connect.php';
include 'log_action.php';
include 'check_auth.php';
include 'cors.php';

header("Content-Type: application/json");

require_auth();

// Always enforce the current authenticated user for profile updates
$user_id = current_user_id();
$full_name = $_POST['full_name'] ?? '';
$contact_number = $_POST['contact_number'] ?? '';

$uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
if (!is_dir($uploadDir)) {
    $uploadDir = __DIR__ . '/uploads/';
}
$profile_pic = null;

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!empty($_FILES['profile_pic']['name'])) {
    $file = $_FILES['profile_pic'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "error" => "Upload error"]);
        exit;
    }

    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($file['size'] > $maxSize) {
        echo json_encode(["success" => false, "error" => "File too large. Max 5MB."]);
        exit;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];
    if (!isset($allowed[$mime])) {
        echo json_encode(["success" => false, "error" => "Invalid file type"]);
        exit;
    }

    $ext = $allowed[$mime];
    try {
        $randomName = bin2hex(random_bytes(16));
    } catch (Exception $e) {
        $randomName = time() . '_' . mt_rand();
    }
    $fileName = $randomName . '.' . $ext;
    $targetFilePath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
        $profile_pic = $fileName; // store just filename, frontend will add path
    } else {
        echo json_encode(["success" => false, "error" => "File upload failed"]);
        exit;
    }
}

if ($profile_pic) {
    $sql = "UPDATE user_profiles SET full_name = ?, contact_number = ?, profile_pic = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $full_name, $contact_number, $profile_pic, $user_id);
} else {
    $sql = "UPDATE user_profiles SET full_name = ?, contact_number = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $full_name, $contact_number, $user_id);
}

if ($stmt->execute()) {
    logAction($user_id, 'update', "Updated profile info", 'update_profile.php');
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
