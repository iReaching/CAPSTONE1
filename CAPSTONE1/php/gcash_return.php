<?php
$status = $_GET['status'] ?? 'unknown';
$reference = $_GET['reference'] ?? '';

$statusLabel = strtoupper($status);
$message = 'Payment status: ' . htmlspecialchars($statusLabel, ENT_QUOTES, 'UTF-8');
if ($reference !== '') {
    $message .= ' - Reference: ' . htmlspecialchars($reference, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Payment Status</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: light;
      }
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #f6f7ff;
        margin: 0;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        color: #1f2937;
      }
      .card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 10px 30px rgba(79, 70, 229, 0.15);
        padding: 2.25rem;
        width: min(90vw, 28rem);
        text-align: center;
      }
      h1 {
        margin: 0 0 1rem 0;
        font-size: 1.75rem;
        color: #312e81;
      }
      p {
        margin: 0.5rem 0;
        line-height: 1.5;
      }
      button, a.button {
        margin-top: 1.75rem;
        background: #4f46e5;
        color: white;
        border: none;
        padding: 0.75rem 1.75rem;
        border-radius: 999px;
        font-size: 0.95rem;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }
      button:hover,
      a.button:hover {
        background: #4338ca;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>GCash Checkout</h1>
      <p><?= $message ?></p>
      <p>You can now return to CondoLink to finish reviewing your dues.</p>
      <a href="javascript:window.close();" class="button">Close this window</a>
    </div>
  </body>
</html>
