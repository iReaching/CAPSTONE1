import React, { useEffect, useMemo, useState } from 'react';
import { BASE_URL } from '../config';
import { assetUrl } from '../lib/asset';
import { Download, Search, ChevronDown, ChevronRight, Filter, Loader2 } from 'lucide-react';

export default function AdminBalances() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');
  const [expanded, setExpanded] = useState({}); // user_id -> bool
  const [ledger, setLedger] = useState({}); // user_id -> entries
  const [loadingRow, setLoadingRow] = useState(null);

  const load = async ()=>{
    try{
      setLoading(true);
      const res = await fetch(`${BASE_URL}get_dues_balance.php`, { credentials:'include' });
      const data = await res.json();
      setBalances(Array.isArray(data?.balances)? data.balances: []);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    return balances.filter(b=>{
      const name = (b.full_name||'').toLowerCase();
      const id = (b.user_id||'').toLowerCase();
      const r = (b.role||'').toLowerCase();
      const passQ = !q || name.includes(q) || id.includes(q);
      const passR = role==='all' || (role==='homeowner' ? r==='homeowner' : r===role);
      return passQ && passR;
    });
  }, [balances, query, role]);

  const toggleExpand = async (uid)=>{
    setExpanded(prev=> ({...prev, [uid]: !prev[uid]}));
    if (!expanded[uid] && !ledger[uid]) {
      try{ setLoadingRow(uid); const r = await fetch(`${BASE_URL}get_dues_ledger.php?user_id=${encodeURIComponent(uid)}`, { credentials:'include' }); const d = await r.json(); setLedger(prev=> ({...prev, [uid]: Array.isArray(d?.entries)? d.entries: []})); } finally { setLoadingRow(null);}    
    }
  };

  const exportCSV = ()=>{
    const rows = [['User ID','Name','Role','Balance']].concat(
      filtered.map(b=> [b.user_id, b.full_name||'', b.role||'', String(b.balance)])
    );
    const csv = rows.map(r=> r.map(v=> `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='balances.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const exportUserCSV = (uid)=>{
    const entries = ledger[uid]||[];
    const rows = [['Date','Type','Amount','Note']].concat(entries.map(e=> [new Date(e.created_at).toISOString(), e.entry_type, e.amount, e.note||'']));
    const csv = rows.map(r=> r.map(v=> `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`ledger_${uid}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const proofFromNote = (note)=>{
    if (!note) return null;
    const m = note.match(/proof:\s*(\S+?)(\)|\s|$)/i);
    if (!m) return null;
    const path = m[1];
    return path;
  };

  const resolveUrl = (p)=> {
    if (!p) return null; return assetUrl(p);
  };

  /*return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="text-2xl font-bold text-gray-900">Balances</div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2"/>
              <input value={query} onChange={(e)=> setQuery(e.target.value)} placeholder="Search user or name" className="pl-7 pr-3 py-2 border rounded-lg" />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2"/>
              <select value={role} onChange={(e)=> setRole(e.target.value)} className="pl-7 pr-3 py-2 border rounded-lg">
                <option value="all">All</option>
                <option value="homeowner">Homeowner</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="guard">Guard</option>
              </select>
            </div>
            <button onClick={load} className="px-3 py-2 border rounded-lg">Refresh</button>
            <button onClick={exportCSV} className="px-3 py-2 bg-indigo-600 text-white rounded-lg inline-flex items-center gap-2"><Download className="w-4 h-4"/> Export CSV</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="p-6 text-gray-600">Loading balances...</div>
          ) : filtered.length===0 ? (
            <div className="p-6 text-gray-600">No results.</div>
          ) : (
            <ul className="divide-y">
              {filtered.map((b)=>{
                const open = !!expanded[b.user_id];
                return (
                  <li key={b.user_id} className="p-4">
                    <div className="flex items-center justify-between">
                      <button onClick={()=> toggleExpand(b.user_id)} className="flex items-center gap-2">
                        {open ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                        <span className="font-semibold text-gray-900">{b.full_name || b.user_id}</span>
                        <span className="text-xs text-gray-500">{b.role || 'Unknown'}</span>
                      </button>
                      <div className={`font-semibold ${Number(b.balance)<0? 'text-green-600': (Number(b.balance)>0? 'text-red-600':'text-gray-800')}`}>
                        {Number(b.balance)<0? `Credit: ₱${Math.abs(Number(b.balance)).toLocaleString()}`: `₱${Number(b.balance).toLocaleString()}`}
                      </div>
                    </div>
                    {open && (
                      <div className="mt-3">
                        {loadingRow===b.user_id ? (
                          <div className="text-gray-600 inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Loading ledger...</div>
                        ) : (
                          <>
                            <div className="flex justify-end mb-2">
                              <button onClick={()=> exportUserCSV(b.user_id)} className="px-3 py-1.5 rounded-lg text-sm text-black">Export ledger CSV</button>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm text-gray-800">
                                <thead>
                                  <tr>
                                    <th className="px-2 py-1 text-left">Date</th>
                                    <th className="px-2 py-1 text-left">Type</th>
                                    <th className="px-2 py-1 text-left">Note / Proof</th>
                                    <th className="px-2 py-1 text-right">Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(ledger[b.user_id]||[]).map((e)=> {
                                    const proof = proofFromNote(e.note||'');
                                    const url = resolveUrl(proof);
                                    const isImg = url && /(png|jpe?g|gif|webp)$/i.test(url);
                                    return (
                                      <tr key={e.id} className="border-t">
                                        <td className="px-2 py-1">{new Date(e.created_at).toLocaleString()}</td>
                                        <td className="px-2 py-1 capitalize">{e.entry_type}</td>
                                        <td className="px-2 py-1">
                                          <div className="flex items-center gap-2">
                                            <span className="truncate max-w-[340px]" title={e.note}>{e.note}</span>
                                            {url && (
                                              isImg ? (
                                                <a href={url} target="_blank" rel="noreferrer" className="block">
                                                  <img src={url} alt="proof" className="h-10 w-10 object-cover rounded border"/>
                                                </a>
                                              ) : (
                                                <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 underline">View proof</a>
                                              )
                                            )}
                                          </div>
                                        </td>
                                        <td className={`px-2 py-1 text-right ${e.entry_type==='payment'? 'text-green-600': (e.entry_type==='late_fee'|| e.entry_type==='charge')? 'text-red-600':'text-gray-800'}`}>{e.entry_type==='payment'? '-':''}₱{Number(e.amount).toLocaleString()}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );*/
}