<?php
header('Content-Type: application/json');
include 'config.php';
session_start();

if (!isset($_SESSION['user'])) {
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$email = $_SESSION['user']['email'];
if ($email === 'admin@loancart.com') {
    // Admin sees all loans
    $loansCursor = $db->applications->find([], ['sort' => ['appliedAt' => -1]]);
} else {
    // Regular user sees their own
    $loansCursor = $db->applications->find(['email' => $email], ['sort' => ['appliedAt' => -1]]);
}
// $loansCursor = $db->applications->find(['email' => $email], ['sort' => ['appliedAt' => -1]]);

$totalLoans = 0;
$activeLoans = 0;
$totalDebt = 0;
$monthlyPayment = 0;
$recentLoans = [];

foreach ($loansCursor as $loan) {
    $totalLoans++;
    if ($loan['status'] == 'approved') {
        $activeLoans++;
        $totalDebt += $loan['amount'];
        $monthlyPayment += ($loan['amount'] / ($loan['tenure'] * 12));
    }
    $emi = round($loan['amount'] / ($loan['tenure'] * 12), 2);
    if (count($recentLoans) < 5) {
        $recentLoans[] = [
            'id' => (string)$loan['_id'],
            'type' => $loan['loanType'],
            'amount' => $loan['amount'],
            'emi' => $emi,
            'remainingTenure' => $loan['remainingTenure'] ?? '',
            'status' => $loan['status'],
            'statusText' => $loan['statusText'] ?? ''
        ];
    }
}

echo json_encode([
    'totalLoans' => $totalLoans,
    'activeLoans' => $activeLoans,
    'totalDebt' => $totalDebt,
    'monthlyPayment' => round($monthlyPayment, 2),
    'recentLoans' => $recentLoans
]);
