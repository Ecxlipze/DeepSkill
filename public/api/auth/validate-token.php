<?php
require_once __DIR__ . '/_otp_common.php';
otp_bootstrap();

$data = otp_json_input();
$cnic = otp_normalize_cnic($data['cnic'] ?? '');
$token = otp_clean_text($data['verificationToken'] ?? '', 200);

if (!$cnic || !$token) {
    otp_respond(400, ['status' => 'error', 'message' => 'OTP verification is required.']);
}

$now = gmdate('c');
$rows = otp_supabase_request(
    'GET',
    'login_otps?select=*&cnic=eq.' . rawurlencode($cnic) . '&token_used_at=is.null&token_expires_at=gt.' . rawurlencode($now) . '&order=consumed_at.desc&limit=1'
);

$row = is_array($rows) ? ($rows[0] ?? null) : null;
if (!$row || !password_verify($token, $row['token_hash'] ?? '')) {
    otp_respond(401, ['status' => 'error', 'message' => 'OTP verification expired. Please request a new code.']);
}

otp_supabase_request(
    'PATCH',
    'login_otps?id=eq.' . rawurlencode($row['id']),
    ['token_used_at' => $now],
    'return=minimal'
);

otp_respond(200, ['status' => 'success', 'message' => 'Login verified.']);
?>
