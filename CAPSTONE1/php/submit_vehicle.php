<?php
include 'db_connect.php';
include 'log_action.php';
include 'check_auth.php';
include 'cors.php';
header("Content-Type: application/json");

// Only homeowners can register their vehicles
require_role(['homeowner']);

$response = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Always trust the session user_id for security
    $user_id = current_user_id();
    $name = $_POST['name'] ?? '';
    $color = $_POST['color'] ?? '';
    $type = $_POST['type_of_vehicle'] ?? '';
    $plate_number = $_POST['plate_number'] ?? '';
    $block = $_POST['block'] ?? '';
    $lot = $_POST['lot'] ?? '';

    if (!$user_id || !$name || !$color || !$type || !$plate_number || !$block || !$lot || !isset($_FILES['image'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit;
    }

    // Enforce single vehicle per tenant
    $chk = $conn->prepare('SELECT COUNT(*) FROM vehicle_registrations WHERE user_id = ?');
    $chk->bind_param('s', $user_id);
    $chk->execute();
    $chk->bind_result($c); $chk->fetch(); $chk->close();
    if ((int)$c > 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Only one vehicle is allowed per tenant']);
        exit;
    }

    // Upload directory: php/uploads/
    $target_dir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
    if (!is_dir($target_dir)) {
        // Fallback to ./uploads/
        $target_dir = __DIR__ . '/uploads/';
    }
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0777, true);
    }

    $image = $_FILES['image'];

    // Basic validations
    if ($image['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Upload error.']);
        exit;
    }

    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($image['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'File too large. Max 5MB.']);
        exit;
    }

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $image['tmp_name']);
    finfo_close($finfo);

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];
    if (!isset($allowed[$mime])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
        exit;
    }

    // Generate safe random filename
    $ext = $allowed[$mime];
    try {
        $randomName = bin2hex(random_bytes(16));
    } catch (Exception $e) {
        $randomName = time() . '_' . mt_rand();
    }
    $filename = $randomName . '.' . $ext;
    $target_file = $target_dir . $filename;

    if (move_uploaded_file($image['tmp_name'], $target_file)) {
        $relative_path = $filename; // store just filename, assetUrl() will handle the full path

        $stmt = $conn->prepare("INSERT INTO vehicle_registrations (user_id, name, color, type_of_vehicle, plate_number, block, lot, vehicle_pic_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssssss", $user_id, $name, $color, $type, $plate_number, $block, $lot, $relative_path);

        if ($stmt->execute()) {
            logAction($user_id, 'upload', "Registered vehicle $plate_number", 'submit_vehicle.php');
            $response['success'] = true;
            $response['message'] = 'Vehicle registered successfully.';
        } else {
            http_response_code(500);
            $response['success'] = false;
            $response['message'] = 'Database error: ' . $stmt->error;
        }
        $stmt->close();
    } else {
        http_response_code(500);
        $response['success'] = false;
        $response['message'] = 'Failed to upload image.';
    }
} else {
    http_response_code(405);
    $response['success'] = false;
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
$conn->close();
?>
