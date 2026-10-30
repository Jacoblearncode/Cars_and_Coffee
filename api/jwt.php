<?php
/**
 * Cars & Coffee — Pure-PHP HMAC-SHA256 JWT & Bcrypt Helpers (PHP 5.4+ Compatible)
 */

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode($payload, $secret = JWT_SECRET) {
    $header = array('alg' => 'HS256', 'typ' => 'JWT');
    if (!isset($payload['iat'])) {
        $payload['iat'] = time();
    }
    if (!isset($payload['exp'])) {
        $payload['exp'] = time() + (86400 * 7);
    }
    $segments = array(
        base64url_encode(json_encode($header)),
        base64url_encode(json_encode($payload))
    );
    $signingInput = implode('.', $segments);
    $signature = hash_hmac('sha256', $signingInput, $secret, true);
    $segments[] = base64url_encode($signature);
    return implode('.', $segments);
}

function jwt_decode($token, $secret = JWT_SECRET) {
    if (!$token || !is_string($token)) {
        return null;
    }
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return null;
    }
    list($headB64, $bodyB64, $sigB64) = $parts;
    $expectedSig = base64url_encode(hash_hmac('sha256', $headB64 . '.' . $bodyB64, $secret, true));

    // Constant-time string comparison compatible with PHP 5.4+
    if (strlen($expectedSig) !== strlen($sigB64)) {
        return null;
    }
    $diff = 0;
    for ($i = 0; $i < strlen($expectedSig); $i++) {
        $diff |= ord($expectedSig[$i]) ^ ord($sigB64[$i]);
    }
    if ($diff !== 0) {
        return null;
    }

    $payload = json_decode(base64url_decode($bodyB64), true);
    if (!is_array($payload)) {
        return null;
    }
    if (isset($payload['exp']) && time() > intval($payload['exp'])) {
        return null;
    }
    return $payload;
}

function get_bearer_token() {
    $authHeader = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        return $matches[1];
    }
    return null;
}

function get_authenticated_user($pdo = null) {
    $token = get_bearer_token();
    if (!$token) {
        return null;
    }
    $payload = jwt_decode($token);
    if (!$payload || !isset($payload['id'])) {
        return null;
    }
    if ($pdo !== null) {
        $stmt = $pdo->prepare('SELECT id, name, email, role, car_make, car_model, car_year, region, avatar, bio FROM users WHERE id = ? LIMIT 1');
        $stmt->execute(array(intval($payload['id'])));
        $user = $stmt->fetch();
        return $user ? $user : null;
    }
    return $payload;
}

function require_auth($pdo) {
    $user = get_authenticated_user($pdo);
    if (!$user) {
        send_error('Authentication required. Please sign in.', 401);
    }
    return $user;
}
