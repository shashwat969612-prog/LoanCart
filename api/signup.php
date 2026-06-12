<?php
header('Content-Type: application/json');
include 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !$data['email'] || !$data['password']) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
    exit;
}

// Check if user exists
$existing = $db->users->findOne(['email' => $data['email']]);
if ($existing) {
    echo json_encode(['status' => 'error', 'message' => 'Email already registered']);
    exit;
}

$hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT);
$user = [
    'name' => $data['name'],
    'email' => $data['email'],
    'phone' => $data['phone'],
    'password' => $data['password'],
    'income' => $data['income'] ?? null,
    'address' => $data['address'] ?? null,
    'creditScore' => $data['creditScore'] ?? null,
    'createdAt' => new MongoDB\BSON\UTCDateTime()
];

$db->users->insertOne($user);

echo json_encode(['status' => 'success', 'message' => 'User registered successfully, Please login to continue.']);
