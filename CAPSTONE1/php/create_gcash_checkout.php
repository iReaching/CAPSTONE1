<?php
header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';

require_once __DIR__ . '/gcash_client.php';
require_once __DIR__ . '/log_action.php';
require_once __DIR__ . '/check_auth.php';

$sessionUserId = current_user_id();
require_role(['homeowner']);

$config = gcash_sandbox_config();
if (!$config['mode_is_sandbox']) {
    echo json_encode([
        'success' => false,
        'message' => 'Xendit sandbox mode is disabled. Set GCASH_MODE=xendit and configure the API keys to use this endpoint.',
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    // Fall back to form-urlencoded payloads
    $input = $_POST;
}

$dueId = isset($input['due_id']) ? (int) $input['due_id'] : 0;
$userId = $sessionUserId ?: ($input['user_id'] ?? '');
$amountOverride = isset($input['amount']) ? (float) $input['amount'] : null;

if ($dueId <= 0 || empty($userId)) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters.']);
    exit;
}

try {
    gcash_ensure_transactions_table($conn);

    $stmt = $conn->prepare('SELECT * FROM monthly_dues WHERE id = ?');
    $stmt->bind_param('i', $dueId);
    $stmt->execute();
    $due = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$due) {
        throw new Exception('Due not found.');
    }
    if ($due['user_id'] !== $userId) {
        throw new Exception('You can only pay dues that are assigned to your account.');
    }
    if ((int) $due['is_paid'] === 1) {
        throw new Exception('This due is already marked as paid.');
    }

    $amount = $amountOverride ?: (float) $due['amount_due'];
    if ($amount <= 0) {
        throw new Exception('Invalid due amount.');
    }

    $amountScale = $config['amount_scale'] ?? 1;
    $scaledAmount = (int) round($amount * $amountScale);
    if ($scaledAmount <= 0) {
        throw new Exception('Scaled amount is invalid for Xendit charge.');
    }

    $reference = gcash_generate_reference($dueId);

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');
    $root = rtrim($scheme . '://' . $host . $basePath, '/');

    $successUrl = $config['success_url'] ?: $root . '/gcash_return.php?status=success';
    $cancelUrl = $config['cancel_url'] ?: $root . '/gcash_return.php?status=cancelled';

    $requestPayload = [
        'reference_id' => $reference,
        'currency' => 'PHP',
        'amount' => $scaledAmount,
        'checkout_method' => 'ONE_TIME_PAYMENT',
        'channel_code' => 'PH_GCASH',
        'channel_properties' => [
            'success_redirect_url' => $successUrl,
            'failure_redirect_url' => $cancelUrl,
            'cancel_redirect_url' => $cancelUrl,
        ],
        'metadata' => [
            'due_id' => $dueId,
            'user_id' => $userId,
            'amount_scale' => $amountScale,
            'amount_display' => $amount,
        ],
        'customer' => [
            'customer_reference_id' => $userId,
        ],
    ];

    $checkoutPayload = gcash_create_checkout_session($config, $requestPayload);
    $checkoutUrl = gcash_extract_checkout_url($checkoutPayload);
    if (!$checkoutUrl) {
        throw new Exception('Xendit did not return a checkout URL. Payload: ' . json_encode($checkoutPayload));
    }

    $status = $checkoutPayload['status'] ?? 'PENDING';

    $transactionId = gcash_store_transaction(
        $conn,
        $dueId,
        $userId,
        $amount,
        $reference,
        $checkoutPayload,
        $status,
        $requestPayload
    );

    // Flag the due as awaiting payment so admins see the request immediately.
    $stmt = $conn->prepare('UPDATE monthly_dues SET payment_requested = 1, gcash_reference = ?, gcash_amount = ? WHERE id = ?');
    $stmt->bind_param('sdi', $reference, $amount, $dueId);
    $stmt->execute();
    $stmt->close();

    logAction($userId, 'update', "Initiated Xendit GCash checkout for due ID {$dueId}", basename(__FILE__));

    echo json_encode([
        'success' => true,
        'transaction_id' => $transactionId,
        'reference' => $reference,
        'checkout_url' => $checkoutUrl,
        'charge_id' => $checkoutPayload['id'] ?? null,
        'status' => $status,
        'raw' => $checkoutPayload,
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
    ]);
}

