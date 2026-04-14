<?php
/**
 * Password Recovery API
 * Generates a temporary password and emails it to the user.
 */

$allowed_origin = "https://deepskills.pk";
header("Access-Control-Allow-Origin: $allowed_origin");
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

if (!$data || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email is required."]);
    exit();
}

$email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

// Path to users data
$usersFile = "../data/users.json";

if (!file_exists($usersFile)) {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "This email is not registered with us. Please check and try again."]);
    exit();
}

$users = json_decode(file_get_contents($usersFile), true);
$found = false;
$tempPassword = "";

foreach ($users as &$user) {
    if (strtolower($user['email']) === strtolower($email)) {
        // Generate a simple 8-character temporary password
        $chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        $tempPassword = "DS-";
        for ($i = 0; $i < 5; $i++) {
            $tempPassword .= $chars[rand(0, strlen($chars) - 1)];
        }
        
        // Hash the temporary password
        $user['password'] = password_hash($tempPassword, PASSWORD_DEFAULT);
        
        // Force reset on next login
        $user['is_first_login'] = true;
        
        $found = true;
        break;
    }
}

if ($found) {
    // Save updated users
    file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));
    
    // Send Email
    $to = $email;
    $subject = "DeepSkills - Password Recovery Request";
    
    $message = "
    <html>
    <head>
        <title>Password Recovery</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
            .header { background: #7B1F2E; color: #fff; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { padding: 30px; background: #f9f9f9; }
            .password-box { background: #fff; padding: 15px; border: 2px dashed #7B1F2E; text-align: center; font-size: 24px; font-weight: bold; color: #7B1F2E; margin: 20px 0; border-radius: 5px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>DeepSkills</h1>
            </div>
            <div class='content'>
                <p>Hello,</p>
                <p>We received a request to reset the password for your DeepSkills account. Your temporary password is provided below:</p>
                <div class='password-box'>$tempPassword</div>
                <p>For security reasons, you will be required to change this password immediately after logging in.</p>
                <p>If you did not request this change, please contact our support team immediately.</p>
                <p>Best Regards,<br>DeepSkills Team</p>
            </div>
            <div class='footer'>
                &copy; 2026 DeepSkills Platform. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: auth@deepskills.pk" . "\r\n";
    
    @mail($to, $subject, $message, $headers);
}

if ($found) {
    echo json_encode(["status" => "success", "message" => "Temporary password sent successfully."]);
} else {
    http_response_code(404);
    echo json_encode(["status" => "error", "message" => "This email is not registered with us. Please check and try again."]);
}
