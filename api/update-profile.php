<?php
header('Content-Type: application/json');
include 'config.php';
session_start();

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!$data['email']) {
    echo json_encode(['status' => 'error', 'message' => 'Email is required.']);
    exit;
}

$updateFields = [
    'name' => $data['name'],
    'phone' => $data['phone'],
    'income' => $data['income'],
    'address' => $data['address'],
    'creditScore' => $data['creditScore']
];

// Update the user in the DB
$updateResult = $db->users->updateOne(
    ['email' => $data['email']],
    ['$set' => $updateFields]
);

if ($updateResult->getModifiedCount() > 0) {
    // Fetch updated user
    $user = $db->users->findOne(['email' => $data['email']]);
    $responseUser = [
        'id' => (string)$user['_id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'phone' => $user['phone'],
        'income' => $user['income'],
        'address' => $user['address'],
        'creditScore' => $user['creditScore']
    ];

    // Update session
    $_SESSION['user'] = $responseUser;

    echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully!', 'user' => $responseUser]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No changes were made.']);
}
