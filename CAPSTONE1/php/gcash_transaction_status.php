<?php
header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';

require_once __DIR__ . '/gcash_client.php';

$config = gcash_sandbox_config();
if (!$config['mode_is_sandbox']) {
    echo json_encode(['success' => false, 'message' => 'Xendit sandbox mode is disabled.']);
    exit;
}

$dueId = isset($_GET['due_id']) ? (int) $_GET['due_id'] : 0;
$reference = $_GET['reference'] ?? '';
$refresh = filter_var($_GET['refresh'] ?? '0', FILTER_VALIDATE_BOOLEAN) || ($_GET['refresh'] ?? '') === '1';
$updated = null;

try {
    gcash_ensure_transactions_table($conn);

    if ($reference) {
        $stmt = $conn->prepare('SELECT * FROM gcash_transactions WHERE reference = ? ORDER BY id DESC LIMIT 1');
        $stmt->bind_param('s', $reference);
    } elseif ($dueId > 0) {
        $stmt = $conn->prepare('SELECT * FROM gcash_transactions WHERE due_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->bind_param('i', $dueId);
    } else {
        throw new Exception('Provide either due_id or reference.');
    }

    $stmt->execute();
    $transaction = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$transaction) {
        echo json_encode(['success' => true, 'found' => false]);
        exit;
    }

    if ($refresh) {
        $updated = gcash_refresh_transaction($conn, $config, $transaction);
        if ($updated) {
            $transaction = $updated;
        }
    }

    echo json_encode([
        'success' => true,
        'found' => true,
        'transaction' => $transaction,
        'refreshed' => $refresh && $updated !== null,
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
