<?php
/**
 * DeepSkills Login Handler
 * Authenticates students and returns session profile details.
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
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email and password are required."]);
    exit();
}

$usersFile = "../data/users.json";
if (!file_exists($usersFile)) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Account not found. Please register first."]);
    exit();
}

$users = json_decode(file_get_contents($usersFile), true) ?: [];
$foundUser = null;

foreach ($users as $u) {
    if ($u['email'] === $email) {
        if (password_verify($password, $u['password'])) {
            $foundUser = $u;
        }
        break;
    }
}

if ($foundUser) {
    if (($foundUser['status'] ?? 'approved') === 'pending') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Your application is still under review. You will receive an email once it is approved."]);
        exit();
    }
    
    if (($foundUser['status'] ?? 'approved') === 'declined') {
        http_response_code(403);
        echo json_encode(["status" => "error", "message" => "Your application was not approved. Please contact support for more details."]);
        exit();
    }

    // Return profile without the password hash
    unset($foundUser['password']);
    echo json_encode(["status" => "success", "user" => $foundUser]);
} else {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Invalid email or password. Please try again."]);
}
?>
