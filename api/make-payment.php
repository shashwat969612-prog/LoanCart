<?php
header('Content-Type: application/json');
include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$loanId = $data['loanId'];

if (!$loanId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Loan ID is required']);
    exit;
}

try {
    $objectId = new MongoDB\BSON\ObjectId($loanId);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid Loan ID format']);
    exit;
}

// Fetch loan
$loan = $db->applications->findOne(['_id' => $objectId]);

if (!$loan) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Loan not found']);
    exit;
}

// Calculate EMI
$amount = (float)$loan['amount'];
$tenureYears = (int)$loan['tenure'];
$rate = 0.085 / 12; // Assuming fixed 8.5% annually
$months = $tenureYears * 12;

$emi = ($amount * $rate * pow(1 + $rate, $months)) / (pow(1 + $rate, $months) - 1);
$emi = round($emi, 2);

// Insert payment
$db->payments->insertOne([
    'loanId' => $objectId,
    'amount' => $emi,
    'paidAt' => new MongoDB\BSON\UTCDateTime()
]);

echo json_encode(['status' => 'success', 'message' => 'Payment successful', 'amount' => $emi]);
