<?php
header('Content-Type: application/json');
include 'config.php';
session_start();

$data = json_decode(file_get_contents("php://input"), true);

$user = $db->users->findOne(['email' => $data['email']]);

if (!$user || $data['password'] != $user['password']) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    exit;
}

// Build full user profile
$fullUser = [
    'id' => (string)$user['_id'],
    'name' => $user['name'] ?? '',
    'email' => $user['email'] ?? '',
    'phone' => $user['phone'] ?? '',
    'income' => $user['income'] ?? '',
    'address' => $user['address'] ?? '',
    'creditScore' => $user['creditScore'] ?? ''
];

// Save in session
$_SESSION['user'] = $fullUser;

// Return in response
echo json_encode([
    'status' => 'success',
    'user' => $fullUser,
    'message' => 'Login successful!'
]);
