<?php
/**
 * DeepSkills Registration Handler
 * Handles student admission, generates credentials, and sends notifications.
 */

// Restrict origins to the authorized domain
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

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No data provided"]);
    exit();
}

// Anti-spam Honeypot Check
if (!empty($data['bot-field'])) {
    echo json_encode(["status" => "success", "message" => "Registration submitted (filtered)", "user" => ["id" => "filtered"]]);
    exit();
}

// Sanitize and Validate
$firstName = strip_tags(trim($data['firstName'] ?? ''));
$lastName = strip_tags(trim($data['lastName'] ?? ''));
$email = filter_var($data['email'] ?? '', FILTER_VALIDATE_EMAIL);
$mobileNo = strip_tags(trim($data['mobileNo'] ?? ''));
$lastEducation = strip_tags(trim($data['lastEducation'] ?? ''));
$age = (int)($data['age'] ?? 0);
$gender = strip_tags(trim($data['gender'] ?? ''));
$selectedCourse = strip_tags(trim($data['selectedCourse'] ?? ''));

// Strict Backend Validation (Mirroring Frontend)
$firstName_valid = preg_match("/^[a-zA-Z\s.-]+$/", $firstName);
$lastName_valid = preg_match("/^[a-zA-Z\s.-]+$/", $lastName);
$mobile_valid = preg_match("/^\+?\d+$/", $mobileNo);

if (!$firstName || !$lastName || !$email || !$mobileNo || !$selectedCourse || !$lastEducation) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "All required fields must be filled correctly."]);
    exit();
}

if (!$firstName_valid || strlen($firstName) > 50 || !$lastName_valid || strlen($lastName) > 50) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid name format or length."]);
    exit();
}

if (!$mobile_valid || strlen($mobileNo) > 15) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid mobile number format or length."]);
    exit();
}

// User Storage File
$usersFile = "../data/users.json";
if (!is_dir("../data")) {
    mkdir("../data", 0755, true);
}

$users = [];
if (file_exists($usersFile)) {
    $users = json_decode(file_get_contents($usersFile), true) ?: [];
}

// Check if user already exists
foreach ($users as $u) {
    if ($u['email'] === $email) {
        http_response_code(409);
        echo json_encode(["status" => "error", "message" => "This email is already registered."]);
        exit();
    }
}

// Generate Random Password
function generatePassword($length = 8) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    return substr(str_shuffle($chars), 0, $length);
}

$generatedPassword = generatePassword(8);
$hashedPassword = password_hash($generatedPassword, PASSWORD_DEFAULT);

// Store New User
$newStudent = [
    "id" => time() . rand(1000, 9999),
    "firstName" => $firstName,
    "lastName" => $lastName,
    "name" => $firstName . " " . $lastName,
    "email" => $email,
    "password" => $hashedPassword,
    "mobileNo" => $mobileNo,
    "lastEducation" => $lastEducation,
    "age" => $age,
    "gender" => $gender,
    "selectedCourse" => $selectedCourse,
    "enrolledCourses" => [
        ["id" => strtolower(str_replace(' ', '-', $selectedCourse)), "title" => $selectedCourse, "progress" => 0, "joined" => date("Y-m-d")]
    ],
    "is_first_login" => true,
    "created_at" => date("Y-m-d H:i:s")
];

$users[] = $newStudent;
file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

// Emails Configuration
$adminEmail = "info@deepskills.pk";
$sender = "dev@deepskills.pk";

// 1. Send Email to Admin (Admission Notification)
$adminSubject = "New Student Admission: " . $firstName . " " . $lastName;
$adminHeaders = "From: DeepSkills System <" . $sender . ">\r\n";
$adminHeaders .= "MIME-Version: 1.0\r\n";
$adminHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";

$adminBody = "
<html>
<body style='font-family: sans-serif; color: #333;'>
    <div style='border: 1px solid #7a2136; padding: 20px; border-radius: 10px;'>
        <h2 style='color: #7a2136;'>New Student Admission</h2>
        <p><strong>Name:</strong> {$firstName} {$lastName}</p>
        <p><strong>Email:</strong> {$email}</p>
        <p><strong>Mobile:</strong> {$mobileNo}</p>
        <p><strong>Education:</strong> {$lastEducation}</p>
        <p><strong>Age:</strong> {$age}</p>
        <p><strong>Gender:</strong> {$gender}</p>
        <p><strong>Selected Course:</strong> <span style='color: #7a2136; font-weight: bold;'>{$selectedCourse}</span></p>
    </div>
</body>
</html>
";

mail($adminEmail, $adminSubject, $adminBody, $adminHeaders);

// 2. Send Welcome Email to Student
$studentSubject = "Welcome to DeepSkills - Your Admission Confirmation";
$studentHeaders = "From: DeepSkills <" . $sender . ">\r\n";
$studentHeaders .= "MIME-Version: 1.0\r\n";
$studentHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";

$studentBody = "
<html>
<body style='font-family: sans-serif; color: #333;'>
    <div style='max-width: 600px; margin: auto; border: 2px solid #7a2136; border-radius: 15px; overflow: hidden;'>
        <div style='background: #7a2136; color: white; padding: 20px; text-align: center;'>
            <h1 style='margin:0;'>Welcome to DeepSkills!</h1>
        </div>
        <div style='padding: 30px;'>
            <h3>Dear {$firstName},</h3>
            <p>Congratulations! Your admission for <strong>{$selectedCourse}</strong> has been received.</p>
            <p>To access your student portal and start your learning journey, please use the following credentials:</p>
            <div style='background: #fdf2f4; padding: 15px; border-radius: 8px; border-left: 5px solid #7a2136;'>
                <p style='margin: 5px 0;'><strong>Login Email:</strong> {$email}</p>
                <p style='margin: 5px 0;'><strong>Temporary Password:</strong> <span style='color: #7a2136; font-size: 1.2rem; font-weight: 700;'>{$generatedPassword}</span></p>
            </div>
            <p style='color: #666; font-size: 0.9rem; margin-top: 15px;'>
                <em>Note: You will be prompted to set your own permanent password when you log in for the first time.</em>
            </p>
            <div style='text-align: center; margin-top: 30px;'>
                <a href='http://deepskills.pk/login' style='background: #7a2136; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;'>Login to Student Dashboard</a>
            </div>
            <p style='margin-top: 30px;'>If you have any questions, feel free to reply to this email.</p>
            <p>Happy Learning!<br><strong>Team DeepSkills</strong></p>
        </div>
    </div>
</body>
</html>
";

mail($email, $studentSubject, $studentBody, $studentHeaders);

echo json_encode(["status" => "success", "message" => "Registration successful. Please check your email for login details.", "user" => [
    "id" => $newStudent["id"],
    "name" => $newStudent["name"],
    "email" => $newStudent["email"],
    "is_first_login" => true
]]);
?>
