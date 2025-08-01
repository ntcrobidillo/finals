<?php
// Use Composer's autoloader, which will be in the parent directory
require __DIR__ . '/../vendor/autoload.php';

use PhpMqtt\Client\MqttClient;

// Configuration
$valid_api_key = 'your-secret-api-key';
$mqtt_broker   = 'localhost';
$mqtt_port     = 1883;
$mqtt_topic    = 'payments/processed';

// Handle CORS and Content-Type headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

// --- API Logic ---
// 1. Authentication
$headers = getallheaders();
if (($headers['X-API-KEY'] ?? '') !== $valid_api_key) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: Invalid API Key']);
    exit();
}

// 2. Get and validate data
$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['user_id']) || !isset($input['amount'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Bad Request: Missing user_id or amount']);
    exit();
}

// 3. Publish to MQTT Message Queue
try {
    $mqtt = new MqttClient($mqtt_broker, $mqtt_port, 'payment-api-publisher');
    $mqtt->connect();
    $mqtt->publish($mqtt_topic, json_encode($input), 0);
    $mqtt->disconnect();

    // 4. Send success response
    http_response_code(200);
    echo json_encode([
        'message' => 'Payment initiated successfully. A notification will be sent.',
        'details' => $input
    ]);
} catch (\Exception $e) {
    // Log error properly in a real app
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error: Could not connect to the message queue.']);
}