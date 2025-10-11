<?php
/**
 * Payment gateway configuration loader.
 *
 * The original implementation targeted the native GCash sandbox. The backend now talks to
 * Xendit's e-wallet API while keeping the legacy helper function names for compatibility.
 */

require_once __DIR__ . '/env.php';

function gcash_sandbox_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $mode = strtolower(getenv('GCASH_MODE') ?: 'mock');

    $amountScale = (int) (getenv('XENDIT_AMOUNT_SCALE') ?: 1);
    if ($amountScale <= 0) {
        $amountScale = 1;
    }

    $config = [
        'mode' => $mode, // mock | xendit
        'secret_key' => getenv('XENDIT_SECRET_KEY') ?: '',
        'public_key' => getenv('XENDIT_PUBLIC_KEY') ?: '',
        'callback_token' => getenv('XENDIT_CALLBACK_TOKEN') ?: '',
        'merchant_id' => getenv('XENDIT_MERCHANT_ID') ?: '',
        'api_base_url' => rtrim(getenv('XENDIT_API_BASE') ?: 'https://api.xendit.co', '/'),
        'success_url' => getenv('GCASH_SUCCESS_URL') ?: '',
        'cancel_url' => getenv('GCASH_CANCEL_URL') ?: '',
        'amount_scale' => $amountScale,
    ];

    $config['charge_endpoint'] = $config['api_base_url'] . '/ewallets/charges';
    $config['mode_is_sandbox'] = in_array($config['mode'], ['sandbox', 'gcash_sandbox', 'xendit', 'xendit_sandbox'], true)
        && !empty($config['secret_key']);

    return $config;
}
