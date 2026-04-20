<?php
/**
 * ============================================================
 *  ANNA — Anthropic API Proxy
 *  Upload this file to the SAME folder as anna-mortgage-advisor.html
 *
 *  ⚙️  SETUP — Two things to change before going live:
 *  1. Replace YOUR_API_KEY_HERE with your Anthropic API key
 *  2. Replace https://yourdomain.com with your actual domain
 *
 *  Get your API key at: https://console.anthropic.com
 * ============================================================
 */

// 🔑 YOUR ANTHROPIC API KEY
define('ANTHROPIC_API_KEY', 'YOUR_API_KEY_HERE');

// 🌐 YOUR DOMAIN (e.g. https://anna.dodavahsolutions.com)
$allowed_origin = 'https://yourdomain.com';

// ── CORS ────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (!empty($origin) && $origin !== $allowed_origin) {
    http_response_code(403);
    echo json_encode(['error' => 'Origin not allowed']);
    exit;
}

header('Access-Control-Allow-Origin: ' . (empty($origin) ? '*' : $allowed_origin));
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Validate body ────────────────────────────────────────────
$body = file_get_contents('php://input');
if (empty($body)) { http_response_code(400); echo json_encode(['error' => 'Empty body']); exit; }

$data = json_decode($body, true);
if (json_last_error() !== JSON_ERROR_NONE) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit; }
if (empty($data['messages'])) { http_response_code(400); echo json_encode(['error' => 'Missing messages']); exit; }

// Force safe model + token cap
$data['model']      = 'claude-sonnet-4-20250514';
$data['max_tokens'] = min((int)($data['max_tokens'] ?? 1000), 1000);

// ── Forward to Anthropic ─────────────────────────────────────
$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($data),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) { http_response_code(502); echo json_encode(['error' => 'Proxy error: ' . $curlError]); exit; }

http_response_code($httpCode);
echo $response;
