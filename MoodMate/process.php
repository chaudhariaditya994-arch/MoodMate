<?php
// process.php - Form handler for MoodMate

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $logFile = 'moods.txt';
    
    if (isset($_POST['mood'])) {
        // Mood form
        $mood = $_POST['mood'] ?? '';
        $notes = $_POST['notes'] ?? '';
        $date = date('Y-m-d H:i:s');
        
        $entry = "[$date] Mood: $mood, Notes: $notes\n";
        file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
        
        echo json_encode(['status' => 'success', 'message' => 'Mood saved!']);
    } elseif (isset($_POST['form_type']) && $_POST['form_type'] === 'personal') {
        // Personal details
        $name = $_POST['name'] ?? '';
        $age = $_POST['age'] ?? '';
        $email = $_POST['email'] ?? '';
        $goals = $_POST['goals'] ?? '';
        $date = date('Y-m-d H:i:s');
        
        $entry = "[$date] Personal: Name=$name, Age=$age, Email=$email, Goals=$goals\n";
        file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
        
        echo json_encode(['status' => 'success', 'message' => 'Details saved!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid form data']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>

