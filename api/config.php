<?php
require_once __DIR__ . '/vendor/autoload.php';
try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $client->listDatabases();
    $db = $client->loanPro;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status'=> 'error', 'message' => 'Database connection failed']);
    exit;
}
?>
