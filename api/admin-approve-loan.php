<?php
header('Content-Type: application/json');
include 'config.php';
session_start();

if ($_SESSION['user']['email'] !== 'admin@loancart.com') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$loanId = $data['loanId'];

$db->applications->updateOne(
    ['_id' => new MongoDB\BSON\ObjectId($loanId)],
    ['$set' => ['status' => 'approved', 'statusText' => 'Approved by Admin']]
);

echo json_encode(['status' => 'success', 'message' => 'Loan approved successfully']);
