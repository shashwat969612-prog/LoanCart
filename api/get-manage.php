<?php
header('Content-Type: application/json');
include 'config.php';
session_start();

if (!isset($_SESSION['user'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user = $_SESSION['user'];
$email = $user['email'];

if ($email === 'admin@loancart.com') {
    // Admin sees all loans
    $loans = $db->applications->find([], ['sort' => ['appliedAt' => -1]]);
} else {
    // Regular user sees their own
    $loans = $db->applications->find(['email' => $email], ['sort' => ['appliedAt' => -1]]);
}

$data = [];

foreach ($loans as $loan) {
    $emi = round($loan['amount'] / ($loan['tenure'] * 12), 2);
    $data[] = [
        'id' => (string)$loan['_id'],
        'type' => ucfirst($loan['loanType']),
        'amount' => $loan['amount'],
        'emi' => $emi,
        'status' => $loan['status'],
        'nextPayment' => $loan['status'] === 'approved' ? 'Dec 15, 2024' : '-'
    ];
}

echo json_encode($data);
