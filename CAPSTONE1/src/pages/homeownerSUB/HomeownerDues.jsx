import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import { 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Upload, 
  DollarSign,
  AlertCircle,
  FileImage,
  Loader2
} from "lucide-react";
import { GCASH_RECIPIENT} from "../../config";

export default function HomeownerDues() {
  const userId = localStorage.getItem("user_id");
  const [dues, setDues] = useState([]);
  const [recipient, setRecipient] = useState(GCASH_RECIPIENT);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  // Store GCASH metadata per due id to avoid mirroring values across cards
  const [gcashMeta, setGcashMeta] = useState({}); // { [dueId]: { reference, sender_name, sender_mobile, amount } }
const [policy, setPolicy] = useState({ dueDay: 10, graceDays: 0, reminderIntervalDays: 7 });

  // Balance and advance payment
  const [balance, setBalance] = useState(0);
  const [adv, setAdv] = useState({ amount: '', proof: null });
  const [advSubmitting, setAdvSubmitting] = useState(false);

  useEffect(() => {
    // Load GCASH settings for recipient override
    fetch(`${BASE_URL}get_settings.php`, { credentials:'include' })
      .then(res=>res.json())
      .then(d => {
        const r = { ...GCASH_RECIPIENT };
        if (d.gcash_name) r.name = d.gcash_name;
        if (d.gcash_mobile) r.mobile = d.gcash_mobile;
        if (d.gcash_qr_url) r.qrUrl = d.gcash_qr_url.startsWith('http')? d.gcash_qr_url : `${BASE_URL}${d.gcash_qr_url}`;
        setRecipient(r);
        // Dues policy
        const p = { ...policy };
        if (d.dues_due_day) p.dueDay = Math.min(28, Math.max(1, parseInt(d.dues_due_day)||10));
p.graceDays = 0;
        if (d.dues_reminder_interval_days) p.reminderIntervalDays = Math.max(1, parseInt(d.dues_reminder_interval_days)||7);
        setPolicy(p);
      })
      .catch(()=>{});
    fetch(`${BASE_URL}get_dues.php?user_id=${userId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setDues(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dues:', err);
        setLoading(false);
      });

    // Fetch balance
    fetch(`${BASE_URL}get_dues_balance.php?user_id=${userId}`, { credentials:'include' })
      .then(r=>r.json())
      .then(d=> setBalance(Number(d?.balance||0)))
      .catch(()=>{});
  }, [userId]);

  const handleProofUpload = async (file, dueId) => {
    if (!file) return;
    const meta = gcashMeta[dueId] || {};
    // Client-side GCASH reference format validation (8-20 alphanumeric or 13 digits)
    const ref = (meta.reference||'').trim();
    if (ref && !(/^[A-Z0-9]{8,20}$/i.test(ref) || /^\d{13}$/.test(ref))) {
      const notification = document.createElement('div');
notification.className = 'fixed top-20 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all';
      notification.innerHTML = '❌ Invalid GCASH reference format';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
      return;
    }

    setUploadingId(dueId);
    const form = new FormData();
    form.append("id", dueId);
    form.append("user_id", userId);
    form.append("payment_proof", file);
    if (meta.reference) form.append('gcash_reference', meta.reference);
    if (meta.sender_name) form.append('gcash_sender_name', meta.sender_name);
    if (meta.sender_mobile) form.append('gcash_sender_mobile', meta.sender_mobile);
    if (meta.amount) form.append('gcash_amount', meta.amount);

    try {
      const response = await fetch(`${BASE_URL}request_payment.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Success notification
        const notification = document.createElement('div');
notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all';
        notification.innerHTML = '✅ Payment proof uploaded successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        // Refresh dues
        const updatedResponse = await fetch(`${BASE_URL}get_dues.php?user_id=${userId}`, { credentials: 'include' });
        const updatedData = await updatedResponse.json();
        setDues(Array.isArray(updatedData) ? updatedData : []);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Error notification
      const notification = document.createElement('div');
notification.className = 'fixed top-20 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all';
      notification.innerHTML = '❌ ' + (error.message || 'Upload failed');
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    } finally {
      setUploadingId(null);
    }
  };

const computeDueDate = (due) => {
    // Prefer server-provided due_date
    if (due?.due_date) {
      try { return new Date(due.due_date); } catch { /* ignore */ }
    }
    const dueMonth = due?.due_month;
    const [y,m] = (dueMonth||'').split('-').map(Number);
    if (!y || !m) return null;
    const d = new Date(y, m-1, policy.dueDay);
    const lastDay = new Date(y, m, 0).getDate();
    if (policy.dueDay > lastDay) d.setDate(lastDay);
    return d;
  };

const isOverdue = (due) => {
    if (Number(due.is_paid) === 1) return false;
if (typeof due.is_overdue !== 'undefined') return Number(due.is_overdue) === 1;
    const d = computeDueDate(due);
    if (!d) return false;
    const today = new Date();
    return today > d;
  };

  // No late fee computation for now per requirements

  const getStatusBadge = (due) => {
    if (Number(due.is_paid) === 1) {
      return (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          Paid
        </div>
      );
    } else if (Number(due.payment_requested) === 1) {
      return (
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          <Clock size={16} />
          Under Review
        </div>
      );
    } else if (isOverdue(due)) {
      return (
        <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          <AlertCircle size={16} />
          Overdue
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
          <Clock size={16} />
          Unpaid
        </div>
      );
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatMonth = (monthStr) => {
    try {
      const date = new Date(monthStr + '-01');
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return monthStr;
    }
  };

  // Scroll and highlight if ?highlight={dueId} present
  useEffect(() => {
    if (loading) return;
    const sp = new URLSearchParams(window.location.search);
    const target = sp.get('highlight');
    if (!target) return;
    const el = document.getElementById(`due-${target}`);
    if (!el) return;
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch {}
    el.classList.add('ring-4','ring-yellow-400','ring-offset-2','ring-offset-yellow-100');
    const t = setTimeout(()=>{
      el.classList.remove('ring-4','ring-yellow-400','ring-offset-2','ring-offset-yellow-100');
    }, 2000);
    // Clean URL
    try {
      sp.delete('highlight');
      const url = `${window.location.pathname}${sp.toString()?`?${sp.toString()}`:''}`;
      window.history.replaceState({}, '', url);
    } catch {}
    return ()=> clearTimeout(t);
  }, [loading, dues]);

  // Compute which dues are covered by existing credit (negative balance)
  const covered = new Set();
  try {
    let credit = balance < 0 ? Math.abs(Number(balance)) : 0;
const unpaid = [...dues].filter(d => Number(d.is_paid)===0).sort((a,b)=> String(a.due_month).localeCompare(String(b.due_month)));
    for (const d of unpaid) {
      const amt = Number(d.outstanding ?? d.amount_due)||0;
      if (credit >= amt) { covered.add(d.id); credit -= amt; } else { break; }
    }
  } catch {}

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading your dues...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Payment method notice + GCASH Recipient */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl md:col-span-2">
            Mode of payment for association dues is GCASH only. Please upload your GCASH payment proof for review.
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-xs text-gray-600 mb-2">GCASH Recipient</div>
            <div className="flex items-center gap-3">
              <img src={recipient.qrUrl} alt="GCASH QR" className="w-20 h-20 object-contain border rounded" onError={(e)=>{e.target.style.display='none'}} />
              <div>
                <div className="text-sm font-semibold text-gray-900">{recipient.name}</div>
                <div className="text-sm text-gray-700">{recipient.mobile}</div>
                <div className="mt-1 flex items-center gap-2">
                  <button type="button" className="text-xs text-indigo-600 underline" onClick={()=>{navigator.clipboard.writeText(recipient.mobile).then(()=>{const n=document.createElement('div');n.className='fixed top-4 right-4 bg-green-600 text-white px-3 py-2 rounded';n.textContent='Number copied';document.body.appendChild(n);setTimeout(()=>n.remove(),1500);});}}>Copy number</button>
                  {recipient.qrUrl && (
                    <button type="button" className="text-xs text-indigo-600 underline" onClick={async ()=>{
                      try {
                        const res = await fetch(recipient.qrUrl);
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'gcash-qr.png';
                        document.body.appendChild(a);
                        a.click();
                        URL.revokeObjectURL(url);
                        a.remove();
                      } catch (e) {
                        window.open(recipient.qrUrl, '_blank');
                      }
                    }}>Download QR</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dues</p>
                <p className="text-2xl font-bold text-gray-900">{dues.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {dues.filter(d => Number(d.is_paid) === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  {dues.filter(d => Number(d.is_paid) === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dues List */}
        {dues.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No dues found</h3>
            <p className="text-gray-600">You don't have any monthly dues at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {dues.map((due) => (
              <div id={`due-${due.id}`} key={due.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left side - Due info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {formatMonth(due.due_month)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign size={16} />
<span className={`text-2xl font-bold ${isOverdue(due) ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatAmount(Number(due.outstanding ?? due.amount_due) || 0)}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">
                            Base: {formatAmount(Number(due.amount_due)||0)} • Late fees: {formatAmount(Number(due.late_total)||0)} • Paid: {formatAmount(Number(due.paid_total)||0)}
                          </div>
                        </div>
                        {!isOverdue(due) && Number(due.is_paid)===0 && (
                          <div className="mt-1 text-xs text-gray-600">
Due date: {(() => { const d = computeDueDate(due); return d? d.toLocaleDateString(): '—'; })()}
                          </div>
                        )}
                      </div>
                      {covered.has(due.id) ? (
                        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          <CheckCircle size={16} />
                          Covered by credit
                        </div>
                      ) : (
                        getStatusBadge(due)
                      )}
                    </div>
                    
                    {Number(due.is_paid) === 1 && due.payment_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500" />
                        Paid on {new Date(due.payment_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Right side - Actions */}
                  <div className="flex-shrink-0">
                    {Number(due.is_paid) === 0 && Number(due.payment_requested) === 1 && (
                      <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Under Review</p>
                          <p className="text-xs text-yellow-600">Waiting for admin approval</p>
                        </div>
                      </div>
                    )}
                    
                    {Number(due.is_paid) === 0 && Number(due.payment_requested) === 0 && !covered.has(due.id) && (
                      <div className="space-y-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-2">Upload payment proof</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="GCASH Reference No." className="w-full border rounded px-3 py-2" value={(gcashMeta[due.id]?.reference)||''} onChange={(e)=>setGcashMeta(prev=> ({...prev, [due.id]: { ...(prev[due.id]||{}), reference: e.target.value }}))} />
                            <input type="text" placeholder="Sender Name" className="w-full border rounded px-3 py-2" value={(gcashMeta[due.id]?.sender_name)||''} onChange={(e)=>setGcashMeta(prev=> ({...prev, [due.id]: { ...(prev[due.id]||{}), sender_name: e.target.value }}))} />
                            <input type="tel" placeholder="Sender Mobile" className="w-full border rounded px-3 py-2" value={(gcashMeta[due.id]?.sender_mobile)||''} onChange={(e)=>setGcashMeta(prev=> ({...prev, [due.id]: { ...(prev[due.id]||{}), sender_mobile: e.target.value }}))} />
                            <input type="number" min="0" step="0.01" placeholder="Amount" className="w-full border rounded px-3 py-2" value={(gcashMeta[due.id]?.amount)||''} onChange={(e)=>setGcashMeta(prev=> ({...prev, [due.id]: { ...(prev[due.id]||{}), amount: e.target.value }}))} />
                          </div>
                          <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl cursor-pointer transition-colors font-medium">
                            {uploadingId === due.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Choose File
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleProofUpload(e.target.files[0], due.id)}
                              className="hidden"
                              disabled={uploadingId === due.id}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FileImage size={12} />
                          Accepts: Images, PDF (Max 5MB)
                        </div>
                      </div>
                    )}
                    
                    {(covered.has(due.id)) && (
                      <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Covered by your credit</p>
                          <p className="text-xs text-green-600">No action needed. This will be applied by admin.</p>
                        </div>
                      </div>
                    )}

                    {Number(due.is_paid) === 1 && (
                      <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Payment Confirmed</p>
                          <p className="text-xs text-green-600">Thank you for your payment!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
