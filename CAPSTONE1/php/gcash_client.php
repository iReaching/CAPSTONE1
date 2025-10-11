<?php
/**
 * Utility helpers for interacting with the Xendit e-wallet (GCash) sandbox.
 *
 * The helper keeps the historical "gcash_*" function names so the rest of the
 * application does not need to change after moving away from the legacy mock flow.
 */

require_once __DIR__ . '/gcash_config.php';
require_once __DIR__ . '/db_connect.php';

/**
 * Ensures the persistence table for wallet transactions exists.
 */
function gcash_ensure_transactions_table(mysqli $conn): void
{
    $conn->query(
        "CREATE TABLE IF NOT EXISTS gcash_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            due_id INT NOT NULL,
            user_id VARCHAR(64) NOT NULL,
            reference VARCHAR(64) NOT NULL,
            gcash_payment_id VARCHAR(128) DEFAULT NULL,
            status VARCHAR(48) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            checkout_url TEXT NULL,
            raw_request TEXT NULL,
            raw_response TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_due (due_id),
            INDEX idx_reference (reference)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    );
}

/**
 * Generates a human readable reference for a payment attempt.
 */
function gcash_generate_reference(int $dueId): string
{
    return 'XND-' . $dueId . '-' . strtoupper(bin2hex(random_bytes(4)));
}

/**
 * Extracts the hosted checkout URL from an Xendit response payload.
 */
function gcash_extract_checkout_url(array $payload): ?string
{
    if (!empty($payload['checkout_url'])) {
        return $payload['checkout_url'];
    }
    if (!empty($payload['actions']) && is_array($payload['actions'])) {
        $actions = $payload['actions'];
        $directKeys = [
            'desktop_web_checkout_url',
            'mobile_web_checkout_url',
            'mobile_deeplink_checkout_url',
        ];
        foreach ($directKeys as $key) {
            if (!empty($actions[$key]) && is_string($actions[$key])) {
                return $actions[$key];
            }
        }
        foreach ($actions as $action) {
            if (is_array($action) && !empty($action['url'])) {
                return $action['url'];
            }
        }
    }
    return null;
}

/**
 * Creates a checkout/payment session via Xendit's e-wallet charge API.
 *
 * @throws Exception on failure
 */
function gcash_create_checkout_session(array $config, array $requestPayload): array
{
    if (empty($config['secret_key'])) {
        throw new Exception('Xendit secret key is not configured.');
    }

    $ch = curl_init($config['charge_endpoint']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
        ],
        CURLOPT_USERPWD => $config['secret_key'] . ':',
        CURLOPT_POSTFIELDS => json_encode($requestPayload),
    ]);

    $response = curl_exec($ch);
    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception("Failed to reach Xendit charge endpoint: {$error}");
    }

    $statusCode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    $payload = json_decode($response, true);
    if ($statusCode < 200 || $statusCode >= 300) {
        $message = $payload['message'] ?? $payload['error_description'] ?? 'Unexpected response';
        if ($payload !== null) {
            $messageDetail = json_encode($payload);
        } else {
            $messageDetail = $response;
        }
        throw new Exception("Xendit checkout creation failed ({$statusCode}): {$messageDetail}");
    }

    return $payload;
}

/**
 * Persists a checkout transaction.
 */
function gcash_store_transaction(
    mysqli $conn,
    int $dueId,
    string $userId,
    float $amount,
    string $reference,
    array $responsePayload,
    string $fallbackStatus = 'PENDING',
    ?array $requestPayload = null
): int {
    $stmt = $conn->prepare(
        "INSERT INTO gcash_transactions (due_id, user_id, reference, gcash_payment_id, status, amount, checkout_url, raw_request, raw_response)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    $paymentId = $responsePayload['id'] ?? null;
    $status = $responsePayload['status'] ?? $fallbackStatus;
    $checkoutUrl = gcash_extract_checkout_url($responsePayload);
    $rawResponse = json_encode($responsePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $rawRequest = $requestPayload ? json_encode($requestPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

    $stmt->bind_param(
        'issssdsss',
        $dueId,
        $userId,
        $reference,
        $paymentId,
        $status,
        $amount,
        $checkoutUrl,
        $rawRequest,
        $rawResponse
    );
    $stmt->execute();
    $insertId = $stmt->insert_id;
    $stmt->close();
    return $insertId;
}

/**
 * Updates an existing transaction's status and stored payload.
 */
function gcash_update_transaction(
    mysqli $conn,
    int $transactionId,
    string $status,
    array $payload = [],
    ?string $checkoutUrl = null,
    ?string $paymentId = null,
    ?string $reference = null
): void {
    $fields = ['status = ?'];
    $types = 's';
    $params = [$status];

    if (!empty($payload)) {
        $fields[] = 'raw_response = ?';
        $types .= 's';
        $params[] = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    if ($checkoutUrl !== null) {
        $fields[] = 'checkout_url = ?';
        $types .= 's';
        $params[] = $checkoutUrl;
    }

    if ($paymentId !== null) {
        $fields[] = 'gcash_payment_id = ?';
        $types .= 's';
        $params[] = $paymentId;
    }

    if ($reference !== null) {
        $fields[] = 'reference = ?';
        $types .= 's';
        $params[] = $reference;
    }

    $types .= 'i';
    $params[] = $transactionId;

    $sql = 'UPDATE gcash_transactions SET ' . implode(', ', $fields) . ' WHERE id = ?';
    $stmt = $conn->prepare($sql);
    $bindParams = [$types];
    foreach ($params as $key => $value) {
        $bindParams[] = &$params[$key];
    }
    call_user_func_array([$stmt, 'bind_param'], $bindParams);
    $stmt->execute();
    $stmt->close();
}

/**
 * Helper to fetch the most recent transaction for a due.
 */
function gcash_latest_transaction(mysqli $conn, int $dueId): ?array
{
    $stmt = $conn->prepare("SELECT * FROM gcash_transactions WHERE due_id = ? ORDER BY id DESC LIMIT 1");
    $stmt->bind_param('i', $dueId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();
    return $row ?: null;
}

/**
 * Retrieves a transaction from Xendit by charge ID.
 */
function gcash_fetch_transaction(array $config, string $chargeId): ?array
{
    if (empty($config['secret_key']) || empty($chargeId)) {
        return null;
    }

    $url = rtrim($config['charge_endpoint'], '/') . '/' . rawurlencode($chargeId);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
        ],
        CURLOPT_USERPWD => $config['secret_key'] . ':',
    ]);

    $response = curl_exec($ch);
    if ($response === false) {
        curl_close($ch);
        return null;
    }

    $statusCode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($statusCode < 200 || $statusCode >= 300) {
        return null;
    }

    $payload = json_decode($response, true);
    return is_array($payload) ? $payload : null;
}

/**
 * Refreshes a stored transaction from Xendit and returns the updated row.
 */
function gcash_refresh_transaction(mysqli $conn, array $config, array $transaction): ?array
{
    if (empty($transaction['gcash_payment_id'])) {
        return null;
    }

    $remote = gcash_fetch_transaction($config, $transaction['gcash_payment_id']);
    if (!$remote) {
        return null;
    }

    $status = $remote['status'] ?? $transaction['status'];
    $checkoutUrl = gcash_extract_checkout_url($remote);
    $reference = $remote['reference_id'] ?? $remote['external_id'] ?? $transaction['reference'];

    gcash_update_transaction(
        $conn,
        (int)$transaction['id'],
        $status,
        $remote,
        $checkoutUrl,
        $remote['id'] ?? $transaction['gcash_payment_id'],
        $reference
    );

    $stmt = $conn->prepare("SELECT * FROM gcash_transactions WHERE id = ?");
    $stmt->bind_param('i', $transaction['id']);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    return $row ?: null;
}
