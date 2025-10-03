import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
import { 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  DollarSign,
  AlertCircle,
  FileImage,
  Loader2,
  Plus,
  Eye,
  Check,
  X,
  Users,
  ExternalLink,
  FileText
} from "lucide-react";
function GcashSettings() {
  const [form, setForm] = useState({ gcash_name: '', gcash_mobile: '', gcash_qr_url: '' });
  const [qrFile, setQrFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    fetch(`${BASE_URL}get_settings.php`, { credentials:'include' })
      .then(r=>r.json())
      .then(d=> setForm({ gcash_name: d.gcash_name || '', gcash_mobile: d.gcash_mobile || '', gcash_qr_url: d.gcash_qr_url || '' }))
      .finally(()=> setLoading(false));
  },[]);

  const save = async ()=>{
    setSaving(true);
    try{
      const fd = new FormData();
      fd.append('gcash_name', form.gcash_name);
      fd.append('gcash_mobile', form.gcash_mobile);
      fd.append('gcash_qr_url', form.gcash_qr_url);
      const res = await fetch(`${BASE_URL}update_settings.php`, { method:'POST', body: fd, credentials:'include' });
      const data = await res.json();
      if (data.success) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all';
        notification.innerHTML = '✅ Settings saved';
        document.body.appendChild(notification); setTimeout(()=>notification.remove(),3000);
      }
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-gray-600">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left: fields */}
      <div className="md:col-span-2 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.gcash_name} onChange={(e)=>setForm({...form, gcash_name:e.target.value})} placeholder="Chateau Valenzuela Condominium" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Mobile</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.gcash_mobile} onChange={(e)=>setForm({...form, gcash_mobile:e.target.value.replace(/[^0-9]/g,'')})} placeholder="09XXXXXXXXX" />
          <p className="mt-1 text-xs text-gray-500">Format: 11 digits (e.g., 09XXXXXXXXX)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">QR Image URL (optional)</label>
          <input className="w-full border rounded-lg px-3 py-2" value={form.gcash_qr_url} onChange={(e)=>setForm({...form, gcash_qr_url:e.target.value})} placeholder="https://... or uploads/settings/qr.png" />
          <p className="mt-1 text-xs text-gray-500">Uploading a file on the right will overwrite this URL.</p>
        </div>
      </div>

      {/* Right: preview + upload */}
      <div className="md:col-span-1">
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="text-sm font-medium text-gray-800 mb-2">QR Image</div>
          <div className="flex items-center gap-4">
            <img alt="QR Preview" className="w-28 h-28 object-contain border rounded bg-white" src={form.gcash_qr_url?.startsWith('http')? form.gcash_qr_url : (form.gcash_qr_url? `${BASE_URL}${form.gcash_qr_url}` : '')} onError={(e)=>{e.target.style.display='none'}} />
            <div className="text-xs text-gray-600">Preview</div>
          </div>
          <div className="mt-3">
            <input id="qr-file" type="file" accept="image/*" className="hidden" onChange={(e)=> setQrFile(e.target.files[0]||null)} />
<label htmlFor="qr-file" className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer bg-white hover:bg-gray-50 text-gray-800">
              <FileImage className="w-4 h-4 text-black" /> Choose file
            </label>
            <button type="button" onClick={async ()=>{
              if(!qrFile){ alert('Choose an image first'); return; }
              setUploading(true);
              try{
                const fd = new FormData(); fd.append('qr', qrFile);
                const res = await fetch(`${BASE_URL}upload_gcash_qr.php`, { method:'POST', body: fd, credentials:'include' });
                const data = await res.json();
                if (data.success) {
                  setForm(f=> ({ ...f, gcash_qr_url: data.url }));
const note=document.createElement('div'); note.className='fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded'; note.textContent='QR uploaded'; document.body.appendChild(note); setTimeout(()=>note.remove(),2000);
                } else {
                  alert(data.message||'Upload failed');
                }
              } finally { setUploading(false); }
            }} disabled={!qrFile || uploading} className="ml-2 inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
              Upload QR
            </button>
            <p className="mt-1 text-xs text-gray-500 truncate max-w-[250px]">{qrFile ? qrFile.name : 'No file chosen'}</p>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">{saving? 'Saving...' : 'Save Settings'}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDues() {
  const [dues, setDues] = useState([]);
  const [formData, setFormData] = useState({ user_id: "", amount_due: "", due_month: "", rate_id: "" });
  const [homeowners, setHomeowners] = useState([]);
  const [rates, setRates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [advance, setAdvance] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeownersRes, duesRes, ratesRes] = await Promise.all([
          fetch(`${BASE_URL}get_homeowners.php`, { credentials: 'include' }),
          fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' }),
          fetch(`${BASE_URL}get_dues_rates.php`, { credentials: 'include' })
        ]);
        
        const homeownersData = await homeownersRes.json();
        const duesData = await duesRes.json();
        const ratesData = await ratesRes.json();
        
        setHomeowners(Array.isArray(homeownersData) ? homeownersData : []);
        setDues(Array.isArray(duesData) ? duesData : []);
        setRates(Array.isArray(ratesData) ? ratesData : []);

        // Preload pending advance
        try { const r = await fetch(`${BASE_URL}get_advance_payments.php?status=pending`, { credentials:'include' }); const d = await r.json(); setAdvance(Array.isArray(d?.payments)? d.payments: []);} catch{}

        // Fetch balances (separately so errors don't block main UI)
        try {
          setLoadingBalances(true);
          const balRes = await fetch(`${BASE_URL}get_dues_balance.php`, { credentials: 'include' });
          const bal = await balRes.json();
          const list = Array.isArray(bal?.balances) ? bal.balances : [];
          setBalances(list);
        } catch (e) {
          console.warn('Failed to load balances', e);
        } finally { setLoadingBalances(false); }

      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('❌ Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
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

  // Helpers for Working Due Month selector
  const ym = (d)=> `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const compareYm = (a,b)=> a.localeCompare(b); // string compare works for YYYY-MM
  const currentYm = ym(new Date());
  const userExistingMonths = (uid)=> dues.filter(d=> d.user_id===uid).map(d=> d.due_month);
  const candidateMonths = (count=18)=>{
    const arr=[]; const now=new Date();
    for (let i=0;i<count;i++){ const dt=new Date(now.getFullYear(), now.getMonth()-i, 1); arr.push(ym(dt)); }
    return arr; // descending from current -> past
  };
  const missingMonthsForUser = (uid)=>{
    if (!uid) return [];
    const existing = new Set(userExistingMonths(uid));
    return candidateMonths().filter(m=> !existing.has(m));
  };
  const monthStatus = (m)=>{
    if (m===currentYm) return 'Due now';
    return compareYm(m, currentYm) < 0 ? 'Overdue' : 'Upcoming';
  };

  // Suggest amount by mapping SQM to fixed tiers: 22.3=>100, 28.5=>200, 31=>300 (choose nearest)
  const suggestAmountForSqm = (sqm) => {
    const tiers = [
      { sq: 22.3, amt: 100 },
      { sq: 28.5, amt: 200 },
      { sq: 31.0, amt: 300 },
    ];
    const s = parseFloat(sqm);
    if (!Number.isFinite(s)) return 0;
    let best = tiers[0];
    for (const t of tiers) {
      if (Math.abs(t.sq - s) < Math.abs(best.sq - s)) best = t;
    }
    return best.amt;
  };

  // Dues policy (fallbacks). Consider fetching from settings like in HomeownerDues if needed.
const policy = { dueDay: 10 };
  const computeDueDate = (due) => {
    if (due?.due_date) { try { return new Date(due.due_date); } catch {} }
    const dueMonth = due?.due_month;
    const [y,m] = (dueMonth||'').split('-').map(Number);
    if (!y || !m) return null;
    const d = new Date(y, m-1, policy.dueDay);
    const last = new Date(y, m, 0).getDate();
    if (policy.dueDay>last) d.setDate(last);
    return d;
  };
  const isOverdue = (due) => {
    if (Number(due.is_paid)===1) return false;
    if (typeof due.is_overdue !== 'undefined') return Number(due.is_overdue)===1;
    const d = computeDueDate(due); if(!d) return false;
    return new Date()>d;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = new FormData();
    form.append("user_id", formData.user_id);
    form.append("amount_due", formData.amount_due);
    form.append("due_month", formData.due_month);
    if (formData.rate_id) form.append("rate_id", formData.rate_id);
    form.append("payment_method", "GCASH");

    try {
      const response = await fetch(`${BASE_URL}add_due.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success !== false) {
        showNotification('✅ Due added successfully!');
        setFormData({ user_id: "", amount_due: "", due_month: "", rate_id: "" });
        setShowAddModal(false);
        
        // Refresh dues list
        const updatedResponse = await fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' });
        const updatedData = await updatedResponse.json();
        setDues(Array.isArray(updatedData) ? updatedData : []);
      } else {
        throw new Error(data.message || 'Failed to add due');
      }
    } catch (error) {
      console.error('Error adding due:', error);
      showNotification('❌ ' + (error.message || 'Failed to add due'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const approvePayment = async (id) => {
    setProcessingId(id);
    const form = new FormData();
    form.append("id", id);
    
    try {
      const response = await fetch(`${BASE_URL}approve_payment.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      showNotification('✅ ' + (data.message || 'Payment approved'));
      
      // Refresh dues list
      const updatedResponse = await fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' });
      const updatedData = await updatedResponse.json();
      setDues(Array.isArray(updatedData) ? updatedData : []);
    } catch (error) {
      console.error('Error approving payment:', error);
      showNotification('❌ Failed to approve payment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPaymentRequest = async (id) => {
    setProcessingId(id);
    const form = new FormData();
    form.append("id", id);
    
    try {
      const response = await fetch(`${BASE_URL}reject_payment.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      showNotification('✅ ' + (data.message || 'Payment request rejected'));
      
      // Refresh dues list
      const updatedResponse = await fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' });
      const updatedData = await updatedResponse.json();
      setDues(Array.isArray(updatedData) ? updatedData : []);
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showNotification('❌ Failed to reject payment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading dues data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Monthly Dues Management</h1>
            </div>
            <p className="text-gray-600">Manage homeowner monthly dues and payment approvals</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add New Due
          </button>
        </div>

        {/* Balances */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Balances</h2>
            </div>
            <button
              onClick={async ()=>{
                try {
                  setLoadingBalances(true);
                  const balRes = await fetch(`${BASE_URL}get_dues_balance.php`, { credentials: 'include' });
                  const bal = await balRes.json();
                  const list = Array.isArray(bal?.balances) ? bal.balances : [];
                  setBalances(list);
                } finally { setLoadingBalances(false);} 
              }}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
            >Refresh</button>
          </div>
          {loadingBalances ? (
            <div className="text-gray-600">Loading balances...</div>
          ) : balances.length === 0 ? (
            <div className="text-gray-600 text-sm">No balance data yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-800">
                <thead>
                  <tr className="text-left text-gray-800">
                    <th className="px-2 py-1">User</th>
                    <th className="px-2 py-1">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b,idx)=> (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1">{b.full_name || b.user_id}</td>
                      <td className={`px-2 py-1 font-semibold ${Number(b.balance) < 0 ? 'text-green-600' : (Number(b.balance)>0 ? 'text-red-600':'text-gray-800')}`}>
                        {Number(b.balance) < 0 ? `Credit: ₱${Math.abs(Number(b.balance)).toLocaleString()}` : `₱${Number(b.balance).toLocaleString()}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rates Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Unit Size Rates</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const label = prompt('Label (e.g., Studio 22.3 sqm)');
                  if (!label) return;
                  const sqm = parseFloat(prompt('Square meters (e.g., 22.3)')||'');
                  if (!sqm) return;
                  const suggested = suggestAmountForSqm(sqm);
                  const amount = parseFloat(prompt('Amount (PHP)', String(suggested))) || suggested;
                  const fd = new FormData(); fd.append('label', label); fd.append('sqm', sqm); fd.append('amount', amount);
                  fetch(`${BASE_URL}add_dues_rate.php`, { method:'POST', body: fd, credentials:'include' })
                    .then(r=>r.json()).then(d=>{ if(d.success){ setRates(r=>[...r,{id: Math.random(), label, sqm, amount}]); } });
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg"
              >Add Rate</button>
            </div>
          </div>
          {rates.length === 0 ? (
            <p className="text-gray-600 text-sm">No rates configured yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-800">
                <thead>
                  <tr className="text-left text-gray-800">
                    <th className="px-2 py-1">Label</th>
                    <th className="px-2 py-1">SQM</th>
                    <th className="px-2 py-1">Amount (PHP)</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((r)=> (
                    <tr key={r.id} className="border-t">
                      <td className="px-2 py-1">{r.label}</td>
                      <td className="px-2 py-1">{Number(r.sqm).toFixed(2)}</td>
                      <td className="px-2 py-1">₱{Number(r.amount).toLocaleString()}</td>
                      <td className="px-2 py-1 space-x-2">
                        <button className="text-indigo-600" onClick={()=>{
                          const label = prompt('New label', r.label) ?? r.label;
                          const sqm = parseFloat(prompt('New sqm', r.sqm)??r.sqm);
                          const amtDefault = (r.amount ?? suggestAmountForSqm(sqm));
                          const amount = parseFloat(prompt('New amount (PHP)', String(amtDefault)) ?? amtDefault);
                          const fd = new FormData(); fd.append('id', r.id); fd.append('label', label); fd.append('sqm', sqm); fd.append('amount', amount);
                          fetch(`${BASE_URL}update_dues_rate.php`, { method:'POST', body: fd, credentials:'include' }).then(res=>res.json()).then(d=>{
                            if(d.success){ setRates(rs=> rs.map(x=> x.id===r.id? {...x,label,sqm,amount}:x)); }
                          });
                        }}>Edit</button>
                        <button className="text-red-600" onClick={()=>{
                          if(!confirm('Delete this rate?')) return;
                          const fd = new FormData(); fd.append('id', r.id);
                          fetch(`${BASE_URL}delete_dues_rate.php`, { method:'POST', body: fd, credentials:'include' }).then(res=>res.json()).then(d=>{
                            if(d.success){ setRates(rs=> rs.filter(x=> x.id!==r.id)); }
                          });
                        }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dues.filter(d => Number(d.is_paid) === 0 && Number(d.payment_requested) === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-red-600">
                  {dues.filter(d => Number(d.is_paid) === 0 && Number(d.payment_requested) === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Advance Payments (pending approval) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Advance Payments (Pending)</h2>
            </div>
            <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg" onClick={async()=>{
              try{
                const r = await fetch(`${BASE_URL}get_advance_payments.php?status=pending`, { credentials:'include' });
                const d = await r.json(); setAdvance(Array.isArray(d?.payments)? d.payments: []);
              }catch{}
            }}>Refresh</button>
          </div>
          {advance.length === 0 ? (
            <div className="text-sm text-gray-600">No pending advance payments.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-800">
                <thead>
                  <tr className="text-left text-gray-800">
                    <th className="px-2 py-1">User</th>
                    <th className="px-2 py-1">Amount</th>
                    <th className="px-2 py-1">Proof</th>
                    <th className="px-2 py-1">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {advance.map((p)=> (
                    <tr key={p.id} className="border-t">
                      <td className="px-2 py-1">{homeowners.find(h=>h.user_id===p.user_id)?.full_name || p.user_id}</td>
                      <td className="px-2 py-1 font-semibold">₱{Number(p.amount).toLocaleString()}</td>
                      <td className="px-2 py-1">
{p.proof_path ? (
                          <a href={assetUrl(p.proof_path)} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View</a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-2 py-1 space-x-2">
                        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async()=>{
                          const fd=new FormData(); fd.append('id', p.id);
                          const r= await fetch(`${BASE_URL}approve_advance_payment.php`, { method:'POST', body: fd, credentials:'include' });
                          const d= await r.json();
                          showNotification(d.success? '✅ Advance payment approved' : `❌ ${d.message||'Failed'}`, d.success? 'success':'error');
                          // refresh list and balances
                          const rr= await fetch(`${BASE_URL}get_advance_payments.php?status=pending`, { credentials:'include' });
                          const dd= await rr.json(); setAdvance(Array.isArray(dd?.payments)? dd.payments: []);
                          try{ const balRes= await fetch(`${BASE_URL}get_dues_balance.php`, { credentials:'include' }); const bal= await balRes.json(); const list= Array.isArray(bal?.balances)? bal.balances: []; setBalances(list);}catch{}
                        }}>Approve</button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async()=>{
                          const fd=new FormData(); fd.append('id', p.id);
                          const r= await fetch(`${BASE_URL}reject_advance_payment.php`, { method:'POST', body: fd, credentials:'include' });
                          const d= await r.json();
                          showNotification(d.success? '✅ Advance payment rejected' : `❌ ${d.message||'Failed'}`, d.success? 'success':'error');
                          const rr= await fetch(`${BASE_URL}get_advance_payments.php?status=pending`, { credentials:'include' });
                          const dd= await rr.json(); setAdvance(Array.isArray(dd?.payments)? dd.payments: []);
                        }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* GCASH Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">GCASH Settings</h2>
            </div>
          </div>
          <GcashSettings />
        </div>

        {/* Quick Checks */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Quick Checks</h2>
          <div className="flex flex-wrap gap-3 items-center text-sm">
            {/* Open GCASH QR URL */}
            <button
              type="button"
              onClick={() => {
                const url = (form?.gcash_qr_url?.startsWith('http') ? form.gcash_qr_url : (form?.gcash_qr_url ? `${BASE_URL}${form.gcash_qr_url}` : ''));
                if (!url) { alert('No QR URL set.'); return; }
                window.open(url, '_blank');
              }}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 text-gray-800"
            >
              <ExternalLink className="w-4 h-4" /> Open GCASH QR
            </button>

            {/* Test Receipt for most recent paid due */}
            <button
              type="button"
              onClick={() => {
                const paid = dues.filter(d => Number(d.is_paid) === 1).sort((a,b)=> new Date(b.payment_date||0)-new Date(a.payment_date||0));
                if (paid.length === 0) { alert('No paid dues yet.'); return; }
                const id = paid[0].id;
                window.open(`${BASE_URL}generate_due_receipt.php?id=${id}`, '_blank');
              }}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg bg-white hover:bg-gray-50 text-gray-800"
            >
              <FileText className="w-4 h-4" /> Test Receipt
            </button>
          </div>
        </div>

        {/* Dues List */}
        {dues.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No dues found</h3>
            <p className="text-gray-600">Start by adding monthly dues for homeowners.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {dues.map((due) => (
              <div key={due.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left side - Due info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-indigo-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {homeowners.find(h => h.user_id === due.user_id)?.full_name || due.user_id}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatMonth(due.due_month)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
<span className={`text-lg font-bold ${isOverdue(due) ? 'text-red-600' : 'text-gray-900'}`}>
                              {formatAmount(Number(due.outstanding ?? due.amount_due) || 0)}
                            </span>
                            <div className="text-xs text-gray-600 mt-1">
                              Base: {formatAmount(Number(due.amount_due)||0)} • Late fees: {formatAmount(Number(due.late_total)||0)} • Paid: {formatAmount(Number(due.paid_total)||0)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(due)}
                    </div>
                    
                    {Number(due.is_paid) === 1 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500" />
                        {due.payment_date ? (
                          <>Paid on {new Date(due.payment_date).toLocaleDateString()} {due.verified_by && <span className="ml-2 text-gray-500">(Verified by {due.verified_by})</span>}</>
                        ) : (
                          <>Paid {due.verified_by && <span className="ml-2 text-gray-500">(Verified by {due.verified_by})</span>}</>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Right side - Actions */}
                  <div className="flex-shrink-0">
                    {Number(due.is_paid) === 0 && Number(due.payment_requested) === 1 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-yellow-800">Payment Proof Submitted</p>
                            <p className="text-sm text-yellow-600">Waiting for your review</p>
                          </div>
                        </div>
                        
                        {/* GCASH Meta */}
                        {(due.gcash_reference || due.gcash_sender_name || due.gcash_sender_mobile || due.gcash_amount) && (
                          <div className="text-sm text-gray-700 mb-3">
                            {due.gcash_reference && <div><span className="font-medium">GCASH Ref:</span> {due.gcash_reference}</div>}
                            {due.gcash_sender_name && <div><span className="font-medium">Sender:</span> {due.gcash_sender_name}</div>}
                            {due.gcash_sender_mobile && <div><span className="font-medium">Mobile:</span> {due.gcash_sender_mobile}</div>}
                            {due.gcash_amount && <div><span className="font-medium">Amount:</span> ₱{Number(due.gcash_amount).toLocaleString()}</div>}
                          </div>
                        )}

                        {/* Receipt */}
                        {Number(due.is_paid) === 1 && (
                          <a href={`${BASE_URL}generate_due_receipt.php?id=${due.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-3 transition-colors mr-4">
                            <FileText size={16} /> Download Receipt
                          </a>
                        )}

                        {due.payment_proof_path && (
                          <button
                            onClick={() => {
                              setModalImage(assetUrl(due.payment_proof_path));
                              setShowModal(true);
                            }}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-3 transition-colors"
                          >
                            <Eye size={16} />
                            View Payment Proof
                          </button>
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => approvePayment(due.id)}
                            disabled={processingId === due.id}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {processingId === due.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check size={16} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => rejectPaymentRequest(due.id)}
                            disabled={processingId === due.id}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {processingId === due.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X size={16} />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    
{Number(due.is_paid) === 0 && Number(due.payment_requested) === 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-800">Payment Pending</p>
                            <p className="text-sm text-red-600">No payment submitted yet</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => approvePayment(due.id)}
                            disabled={processingId === due.id}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {processingId === due.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                Mark as Paid
                              </>
                            )}
                          </button>
                          {(() => {
                            const b = balances.find(b=> b.user_id===due.user_id);
                            const userBal = Number(b?.balance||0);
                            const outstanding = Number(due.outstanding ?? 0);
                            if (userBal < 0 && outstanding > 0) {
                              return (
                                <button
                                  onClick={async()=>{
                                    setProcessingId(due.id);
                                    try{
                                      const fd=new FormData(); fd.append('due_id', String(due.id));
                                      const r = await fetch(`${BASE_URL}apply_credit_to_due.php`, { method:'POST', body: fd, credentials:'include' });
                                      const data = await r.json();
                                      showNotification(data.success? `✅ Applied credit: ₱${Number(data.applied||0).toLocaleString()}` : `❌ ${data.message||'Failed'}`, data.success?'success':'error');
                                      // refresh dues and balances
                                      const updatedResponse = await fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' });
                                      const updatedData = await updatedResponse.json();
                                      setDues(Array.isArray(updatedData) ? updatedData : []);
                                      const balRes = await fetch(`${BASE_URL}get_dues_balance.php`, { credentials: 'include' });
                                      const bal = await balRes.json(); setBalances(Array.isArray(bal?.balances)? bal.balances: []);
                                    } finally { setProcessingId(null); }
                                  }}
                                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >Apply Credit</button>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {Number(due.is_paid) === 1 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">Payment Confirmed</p>
                            <p className="text-sm text-green-600">Successfully processed</p>
                          </div>
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
      
      {/* View Proof Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Payment Proof</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={modalImage}
                alt="Payment Proof"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Due Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Add New Due</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Homeowner</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                  required
                >
                  <option value="">Select Homeowner</option>
                  {homeowners.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.full_name || user.user_id}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Rate selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Size (sqm) - GCASH only</label>
                <select
                  value={formData.rate_id}
                  onChange={(e) => {
                    const rate = rates.find(r => String(r.id) === e.target.value);
                    const amt = rate ? Number(rate.amount) : "";
                    setFormData({ ...formData, rate_id: e.target.value, amount_due: amt });
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                  required
                >
                  <option value="">Select unit size</option>
                  {rates.map(r => (
                    <option key={r.id} value={r.id}>{r.label} — ₱{Number(r.amount).toLocaleString()}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-indigo-600">Mode of payment: GCASH only</p>
              </div>

              {/* Amount auto-filled from rate, editable in case of overrides */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due (auto-filled)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={formData.amount_due}
                    onChange={(e) => setFormData({ ...formData, amount_due: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Month</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                    value={formData.due_month || ''}
                    onChange={(e)=> setFormData({ ...formData, due_month: e.target.value })}
                    disabled={!formData.user_id}
                    required
                  >
                    <option value="" disabled>{!formData.user_id? 'Select a homeowner first' : 'Select month'}</option>
                    {formData.user_id && missingMonthsForUser(formData.user_id).map((m)=> (
                      <option key={m} value={m}>
                        {formatMonth(m)} — {monthStatus(m)}
                      </option>
                    ))}
                    {formData.user_id && missingMonthsForUser(formData.user_id).length===0 && (
                      <option value="" disabled>All months up to current are already billed</option>
                    )}
                  </select>
                </div>
                {formData.due_month && (
                  <p className="mt-1 text-xs text-gray-600">Selected: {formatMonth(formData.due_month)} • {monthStatus(formData.due_month)}</p>
                )}
              </div>
              
              <div className="text-xs text-gray-500 mb-2">Mode of payment is enforced as GCASH across the system.</div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Due
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
