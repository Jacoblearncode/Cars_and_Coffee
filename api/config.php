<?php
/**
 * Cars & Coffee — Database & CORS Configuration (PHP 5.4+ / Swinburne Mercury Compatible)
 */

@ini_set('memory_limit', '16M');
date_default_timezone_set('Asia/Kuching');

$localConfigPath = dirname(__FILE__) . '/config.local.php';
$localConfig = file_exists($localConfigPath) ? include $localConfigPath : array();

function cc_cfg($key, $default = '') {
    global $localConfig;
    if (isset($localConfig[$key]) && $localConfig[$key] !== '') {
        return $localConfig[$key];
    }
    $env = getenv($key);
    if ($env !== false && $env !== '') {
        return $env;
    }
    return $default;
}

define('DB_HOST', cc_cfg('DB_HOST', '127.0.0.1'));
define('DB_NAME', cc_cfg('DB_NAME', 'cars_and_coffee_db'));
define('DB_USER', cc_cfg('DB_USER', 'root'));
define('DB_PASS', cc_cfg('DB_PASS', ''));
define('JWT_SECRET', cc_cfg('JWT_SECRET', 'cars-and-coffee-cos30043-dev-secret-2026'));

function send_cors_headers() {
    header('Content-Type: application/json; charset=utf-8');
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function send_json($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

function send_error($message, $status = 400) {
    send_json(array('error' => $message), $status);
}

function get_pdo() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8';
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, array(
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false
        ));
        return $pdo;
    } catch (PDOException $e) {
        send_error('Database connection failed. Verify api/config.local.php settings.', 500);
    }
}

function get_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return array();
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : array();
}
