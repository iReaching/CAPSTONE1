import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { Megaphone, Check, X, Loader2, User } from "lucide-react";

export default function MarketModeration() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}get_market_posts.php?status=pending`, { credentials: 'include' });
      const data = await res.json();
      setPending(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const act = async (id, action) => {
    setActingId(id);
    try {
      const fd = new FormData();
      fd.append('id', id);
      fd.append('action', action);
      const res = await fetch(`${BASE_URL}update_market_post_status.php`, { method: 'POST', body: fd, credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        fetchPending();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Marketplace Moderation</h3>
        <span className="ml-auto text-xs text-gray-500">Approve or reject tenant posts</span>
      </div>
      {loading ? (
        <div className="p-6 text-gray-600">Loading pending posts...</div>
      ) : pending.length === 0 ? (
        <div className="p-6 text-gray-600">No pending posts.</div>
      ) : (
        <ul className="divide-y">
          {pending.map((p) => (
            <li key={p.id} className="p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{p.poster_name || p.user_id}</span>
                  <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.category === 'for_sale' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.category === 'for_sale' ? 'For Sale' : 'For Rent'}
                  </span>
                </div>
                <div className="mt-0.5 font-semibold text-gray-900">{p.title}</div>
                {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
                {(p.images && p.images.length>0) ? (
              <div className="mt-2">
                <div className="flex gap-2 overflow-x-auto snap-x">
                  {p.images.map((img, idx)=> {
                    const src = typeof img === 'string' ? img : (img.path || '');
                    const id = typeof img === 'object' ? img.id : null;
                    return (
                      <div key={id ?? idx} className="relative">
                        <img src={(src.startsWith('http')? src : `${BASE_URL}${src}`)} alt={`Listing ${idx+1}`} className="h-32 rounded-md border object-cover snap-center" onError={(e)=>{e.currentTarget.style.display='none';}} />
                        {id && (
                          <button
                            type="button"
                            onClick={async ()=>{
                              if(!confirm('Delete this image?')) return;
                              try{
                                const fd = new FormData(); fd.append('id', id);
                                const r = await fetch(`${BASE_URL}delete_market_post_image.php`, { method:'POST', body: fd, credentials:'include' });
                                const data = await r.json();
                                if (data.success) {
                                  // remove locally
                                  setPending(prev => prev.map(x => x.id===p.id? { ...x, images: (x.images||[]).filter(im=> (typeof im==='object'? im.id: null) !== id) }: x));
                                }
                              }catch(e){ console.error(e);}                    
                            }}
                            className="absolute top-1 right-1 text-xs bg-red-600 text-white rounded px-1 py-0.5"
                          >Delete</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
                ) : p.image_path ? (
                  <div className="mt-2">
                    <img src={(p.image_path.startsWith('http')? p.image_path : `${BASE_URL}${p.image_path}`)} alt="Listing" className="max-h-32 rounded-md border object-cover" onError={(e)=>{e.currentTarget.style.display='none';}} />
                  </div>
                ) : null}
                {p.price !== null && p.price !== undefined && (
                  <div className="text-sm text-indigo-700 font-semibold mt-1">₱{Number(p.price).toLocaleString()}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => act(p.id, 'approve')} disabled={actingId === p.id} className="inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                  {actingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                </button>
                <button onClick={() => act(p.id, 'reject')} disabled={actingId === p.id} className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
                  {actingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
