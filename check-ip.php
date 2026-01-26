<?php
require_once 'check-ip.php';
header('Content-Type: application/json');

/* -------- CONFIG -------- */
$START_IP = '10.0.0.1';
$END_IP   = '10.0.0.254';

/* -------- GET REAL CLIENT IP -------- */
function get_client_ip() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '';
}

/* -------- CHECK IP RANGE -------- */
function ip_in_range($ip, $start, $end) {
    return ip2long($ip) !== false &&
           ip2long($ip) >= ip2long($start) &&
           ip2long($ip) <= ip2long($end);
}

$client_ip = get_client_ip();

/* -------- VALIDATE -------- */
if (!ip_in_range($client_ip, $START_IP, $END_IP)) {
    http_response_code(403);
    echo json_encode([
        'allowed' => false,
        'ip' => $client_ip
    ]);
    exit;
}

/* -------- ALLOWED -------- */
echo json_encode([
    'allowed' => true,
    'ip' => $client_ip
]);
