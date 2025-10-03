<?php
include 'db_connect.php';
include 'cors.php';
header('Content-Type: text/html; charset=utf-8');

$id = intval($_GET['id'] ?? 0);
if (!$id) { echo 'Missing id'; exit; }

// Fetch due with user and verifier
$sql = "SELECT md.*, u.user_id, up.full_name, up.contact_number, dr.label AS rate_label
        FROM monthly_dues md
        LEFT JOIN users u ON md.user_id = u.user_id
        LEFT JOIN user_profiles up ON up.user_id = u.user_id
        LEFT JOIN dues_rates dr ON dr.id = md.rate_id
        WHERE md.id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $id);
$stmt->execute();
$res = $stmt->get_result();
$due = $res->fetch_assoc();
$stmt->close();

if (!$due) { echo 'Not found'; exit; }

$verified_by = $due['verified_by'] ?? '';
$verifier = '';
if ($verified_by) {
  $s2 = $conn->prepare("SELECT up.full_name FROM user_profiles up WHERE up.user_id = ?");
  $s2->bind_param('s',$verified_by);
  $s2->execute();
  $r2 = $s2->get_result()->fetch_assoc();
  $verifier = $r2['full_name'] ?? $verified_by;
  $s2->close();
}

$gcash_name = '';$gcash_mobile='';$gcash_qr_url='';
$rows = $conn->query("SELECT `key`,`value` FROM app_settings");
while ($r = $rows->fetch_assoc()) { if ($r['key']==='gcash_name') $gcash_name=$r['value']; if($r['key']==='gcash_mobile') $gcash_mobile=$r['value']; if($r['key']==='gcash_qr_url') $gcash_qr_url=$r['value']; }

// If QR is a relative path like 'uploads/settings/...', prefix with current script base '/php/'
if ($gcash_qr_url && !preg_match('~^https?://~i', $gcash_qr_url)) {
  // compute public base for this script
  $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
  $scriptDir = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/'); // e.g., /php
  $base = $scheme . '://' . $host . $scriptDir . '/';
  $gcash_qr_url = $base . ltrim($gcash_qr_url, '/');
}

$style = "body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111} .box{border:1px solid #ddd;border-radius:12px;padding:16px;margin-bottom:16px} .row{display:flex;justify-content:space-between} .muted{color:#666;font-size:12px} .title{font-weight:700;font-size:18px;margin-bottom:8px} .h{font-weight:600} .qr{width:100px;height:100px;object-fit:contain;border:1px solid #eee;border-radius:8px} .btn{display:inline-block;margin-top:8px;padding:8px 12px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none} @media print {.btn{display:none}}";

$amount = number_format((float)$due['amount_due'],2);
$paid_on = $due['payment_date'] ? date('M d, Y', strtotime($due['payment_date'])) : '';
$verified_at = $due['verified_at'] ? date('M d, Y H:i', strtotime($due['verified_at'])) : '';

$gcash_amount = $due['gcash_amount'] !== null ? number_format((float)$due['gcash_amount'],2) : '';

echo "<html><head><meta charset='utf-8'><title>Receipt #{$id}</title><style>{$style}</style></head><body>";
echo "<div class='title'>Payment Receipt</div>";
echo "<div class='box'><div class='row'><div><div class='h'>Tenant</div>{$due['full_name']} ({$due['user_id']})<div class='muted'>{$due['contact_number']}</div></div><div><div class='h'>Due Month</div>".htmlspecialchars($due['due_month'])."</div></div><div class='row'><div><div class='h'>Amount Due</div>₱{$amount}</div><div><div class='h'>Status</div>Paid</div></div></div>";

echo "<div class='box'><div class='row'><div><div class='h'>GCASH Reference</div>".htmlspecialchars($due['gcash_reference'] ?? '')."</div><div><div class='h'>GCASH Amount</div>".($gcash_amount? '₱'.$gcash_amount : '')."</div></div><div class='row'><div><div class='h'>Sender</div>".htmlspecialchars($due['gcash_sender_name'] ?? '')."</div><div><div class='h'>Mobile</div>".htmlspecialchars($due['gcash_sender_mobile'] ?? '')."</div></div></div>";

echo "<div class='box'><div class='row'><div><div class='h'>Paid On</div>{$paid_on}</div><div><div class='h'>Verified By</div>".htmlspecialchars($verifier)."</div></div><div class='muted'>Verified at {$verified_at}</div></div>";

echo "<div class='box'><div class='row'><div><div class='h'>Recipient</div>".htmlspecialchars($gcash_name)."<div class='muted'>".htmlspecialchars($gcash_mobile)."</div></div><div>".($gcash_qr_url?"<img class='qr' src='".htmlspecialchars($gcash_qr_url)."' alt='QR'>":"")."</div></div></div>";

echo "<a class='btn' href='javascript:window.print()'>Print / Save as PDF</a>";
echo "</body></html>";
?>