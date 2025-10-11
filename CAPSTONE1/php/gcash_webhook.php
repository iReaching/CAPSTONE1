<?php
// Webhook endpoint for Xendit e-wallet notifications.
require_once __DIR__ . '/gcash_client.php';
require_once __DIR__ . '/log_action.php';

$config = gcash_sandbox_config();
if (!$config['mode_is_sandbox']) {
    http_response_code(412);
    echo json_encode(['success' => false, 'message' => 'Xendit sandbox mode is disabled.']);
    exit;
}

$callbackToken = $_SERVER['HTTP_X_CALLBACK_TOKEN'] ?? '';
if (!empty($config['callback_token']) && !hash_equals($config['callback_token'], $callbackToken)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid webhook token.']);
    exit;
}

$rawPayload = file_get_contents('php://input');
$event = json_decode($rawPayload, true);

if (!is_array($event)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid webhook payload.']);
    exit;
}

$data = $event['data'] ?? $event;
$status = strtolower($data['status'] ?? '');
$reference = $data['reference_id'] ?? $data['external_id'] ?? null;
$chargeId = $data['id'] ?? null;
$amount = $data['amount'] ?? $data['charge_amount'] ?? null;

try {
    gcash_ensure_transactions_table($conn);

    $transaction = null;
    if ($chargeId) {
        $stmt = $conn->prepare('SELECT * FROM gcash_transactions WHERE gcash_payment_id = ? ORDER BY id DESC LIMIT 1');
        $stmt->bind_param('s', $chargeId);
        $stmt->execute();
        $transaction = $stmt->get_result()->fetch_assoc();
        $stmt->close();
    }

    if (!$transaction && $reference) {
        $stmt = $conn->prepare('SELECT * FROM gcash_transactions WHERE reference = ? ORDER BY id DESC LIMIT 1');
        $stmt->bind_param('s', $reference);
        $stmt->execute();
        $transaction = $stmt->get_result()->fetch_assoc();
        $stmt->close();
    }

    if (!$transaction) {
        throw new Exception('Unknown transaction reference.');
    }

    gcash_update_transaction(
        $conn,
        (int) $transaction['id'],
        $data['status'] ?? $transaction['status'],
        $data,
        gcash_extract_checkout_url($data),
        $chargeId ?? $transaction['gcash_payment_id'],
        $reference ?? $transaction['reference']
    );

    $normalized = $status;
    $successStatuses = ['success', 'succeeded', 'paid', 'completed'];
    $failureStatuses = ['failed', 'canceled', 'cancelled', 'voided', 'declined', 'expired', 'refunded', 'reversed'];

    if (in_array($normalized, $successStatuses, true)) {
        $dueId = (int) $transaction['due_id'];
        $now = date('Y-m-d H:i:s');
        $referenceToStore = $reference ?? $transaction['reference'];
        $amountScale = $config['amount_scale'] ?? 1;
        $amountToStore = $transaction['amount'];
        if ($amount !== null) {
            $amountToStore = $amountScale > 0 ? ((float) $amount) / $amountScale : (float) $amount;
        }
        $stmt = $conn->prepare(
            "UPDATE monthly_dues SET is_paid = 1, payment_requested = 0, payment_date = ?, gcash_reference = ?, gcash_amount = ?, payment_method = 'GCASH' WHERE id = ?"
        );
        $stmt->bind_param('ssdi', $now, $referenceToStore, $amountToStore, $dueId);
        $stmt->execute();
        $stmt->close();
        logAction($transaction['user_id'], 'update', "Xendit webhook marked due {$dueId} as paid", basename(__FILE__));
    } elseif (in_array($normalized, $failureStatuses, true)) {
        $dueId = (int) $transaction['due_id'];
        $stmt = $conn->prepare('UPDATE monthly_dues SET payment_requested = 0 WHERE id = ?');
        $stmt->bind_param('i', $dueId);
        $stmt->execute();
        $stmt->close();
        logAction($transaction['user_id'], 'update', "Xendit webhook reported due {$dueId} as {$status}", basename(__FILE__));
    }

    http_response_code(200);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
