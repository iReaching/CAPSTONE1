<?php
// Lightweight auth helper for future session-based protection
// Usage: include 'check_auth.php'; then call require_auth() or require_role([...])

// Secure session settings (effective when running over HTTPS in production)
session_set_cookie_params([
    'lifetime' => 0,             // session cookie
    'path' => '/',               // ensure cookie is sent to all paths
    // Do NOT set 'domain' for localhost; browsers may ignore it if set to 'localhost'
    'httponly' => true,
    'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
    'samesite' => 'Lax',         // works for same-site (localhost:5173 -> localhost)
]);
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function is_authenticated() {
    return isset($_SESSION['user_id']) && isset($_SESSION['role']);
}

function current_user_id() {
    return $_SESSION['user_id'] ?? null;
}

function current_role() {
    return $_SESSION['role'] ?? null;
}

function require_auth() {
    if (!is_authenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function require_role($roles) {
    if (!is_authenticated() || !in_array($_SESSION['role'], $roles, true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
}
