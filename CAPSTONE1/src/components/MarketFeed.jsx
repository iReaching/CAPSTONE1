import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { Megaphone, Store, Home, Send, Loader2, Check, X, User } from "lucide-react";

export default function MarketFeed({ role }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: "for_sale", title: "", description: "", price: "", image: null });

  const isTenant = role === "homeowner"; // tenant/homeowner can compose

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}get_market_posts.php?status=approved`, { credentials: "include" });
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("market feed load", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const notify = (msg, type = "success") => {
    const el = document.createElement("div");
    el.className = `fixed top-20 right-4 ${type === "success" ? "bg-green-600" : "bg-red-600"} text-white px-4 py-2 rounded-lg shadow z-50`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  const submitPost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("category", form.category);
      fd.append("title", form.title.trim());
      fd.append("description", form.description.trim());
      if (form.price !== "") fd.append("price", form.price);
      if (form.images && form.images.length>0) {
        Array.from(form.images).forEach(f=> fd.append('images[]', f));
      } else if (form.image) {
        fd.append('image', form.image); // backward compatible single image
      }

      const res = await fetch(`${BASE_URL}create_market_post.php`, { method: "POST", body: fd, credentials: "include" });
      const data = await res.json();
      if (data.success) {
        notify("Post submitted for admin approval");
        setForm({ category: "for_sale", title: "", description: "", price: "", image: null, images: null });
      } else {
        throw new Error(data.message || "Failed");
      }
    } catch (e) {
      console.error(e);
      notify(e.message || "Failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Composer for tenants only */}
      {isTenant && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">Community Marketplace</h3>
            <span className="ml-auto text-xs text-gray-500">Admin approval required</span>
          </div>
          <form onSubmit={submitPost} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border rounded-lg p-2"
              disabled={submitting}
            >
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
            </select>
            <input
              type="text"
              placeholder={form.category === "for_sale" ? "e.g. Graham Bars" : "e.g. Apartment 1"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border rounded-lg p-2"
              maxLength={120}
              required
              disabled={submitting}
            />
            <input
              type="text"
              placeholder="Short description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border rounded-lg p-2"
              maxLength={300}
              disabled={submitting}
            />
            <div className="flex gap-2 md:col-span-2">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price (optional)"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border rounded-lg p-2 w-full"
                disabled={submitting}
              />
              <label className="inline-flex items-center px-3 py-2 border rounded-lg bg-white text-gray-800 cursor-pointer">
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=> {
                  const files = e.target.files; setForm({...form, images: files, image: null});
                  // generate previews
                  if (files && files.length) {
                    const urls = Array.from(files).map(f=> URL.createObjectURL(f));
                    setForm(prev=> ({...prev, previews: urls}));
                  } else {
                    setForm(prev=> ({...prev, previews: []}));
                  }
                }} />
                Upload Images
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          {/* Previews */}
          {form.previews && form.previews.length>0 && (
            <div className="md:col-span-5 -mt-1">
              <div className="flex gap-2 flex-wrap">
                {form.previews.map((u, idx)=> (
                  <img key={idx} src={u} alt={`preview ${idx+1}`} className="h-16 w-16 object-cover rounded border" />
                ))}
              </div>
            </div>
          )}
          </form>
        </div>
      )}

      {/* Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-gray-900">Latest Listings</h3>
        </div>
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No posts yet.</div>
        ) : (
          <ul className="divide-y">
            {posts.map((p) => (
              <li key={p.id} className="p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{p.poster_name || p.user_id}</span>
                    <span className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.category === "for_sale" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {p.category === "for_sale" ? "For Sale" : "For Rent"}
                    </span>
                  </div>
                  <div className="mt-0.5 font-semibold text-gray-900">{p.title}</div>
                  {p.description && <div className="text-sm text-gray-600">{p.description}</div>}
                  {(p.images && p.images.length>0) ? (
                    <div className="mt-2">
                      <div className="flex gap-2 overflow-x-auto snap-x">
                        {p.images.map((img, idx)=> (
                          <img key={idx} src={(img.startsWith('http')? img : `${BASE_URL}${img}`)} alt={`Listing ${idx+1}`} className="h-40 rounded-md border object-cover snap-center" onError={(e)=>{e.currentTarget.style.display='none';}} />
                        ))}
                      </div>
                    </div>
                  ) : p.image_path ? (
                    <div className="mt-2">
                      <img src={(p.image_path.startsWith('http')? p.image_path : `${BASE_URL}${p.image_path}`)} alt="Listing" className="max-h-40 rounded-md border object-cover" onError={(e)=>{e.currentTarget.style.display='none';}} />
                    </div>
                  ) : null}
                  {p.price !== null && p.price !== undefined && (
                    <div className="text-sm text-indigo-700 font-semibold mt-1">₱{Number(p.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
