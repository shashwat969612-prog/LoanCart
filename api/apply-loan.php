<?php
header('Content-Type: application/json');
include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    exit;
}

// For MongoDB
try {
    $application = [
        'loanType' => $data['loanType'],
        'amount' => (float)$data['amount'],
        'tenure' => (int)$data['tenure'],
        'name' => $data['fullName'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'income' => (float)$data['income'],
        'purpose' => $data['purpose'],
        'status' => 'pending',
        'submittedAt' => new MongoDB\BSON\UTCDateTime()
    ];
    $result = $db->applications->insertOne($application);
    echo json_encode(['status' => 'success', 'message' => 'Application submitted successfully!']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database insert error: ' . $e->getMessage()]);
    exit;
}
