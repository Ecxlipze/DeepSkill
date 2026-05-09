<?php
/**
 * DeepSkills Password Update Handler
 * Allows students to set their permanent password on first login.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method not allowed"]);
    exit();
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No data provided"]);
    exit();
}

$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
$newPassword = $data['newPassword'] ?? '';

if (!$email || strlen($newPassword) < 6) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Valid email and a password of at least 6 characters are required."]);
    exit();
}

$usersFile = "../data/users.json";
if (!file_exists($usersFile)) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User record not found."]);
    exit();
}

$users = json_decode(file_get_contents($usersFile), true) ?: [];
$found = false;

foreach ($users as &$u) {
    if ($u['email'] === $email) {
        $u['password'] = password_hash($newPassword, PASSWORD_DEFAULT);
        $u['is_first_login'] = false;
        $found = true;
        break;
    }
}

if ($found) {
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    echo json_encode(["status" => "success", "message" => "Password updated successfully. You can now access your dashboard."]);
} else {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "User not found."]);
}
?>
