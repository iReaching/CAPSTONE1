import React, { useEffect, useState } from "react";
import { Pencil, Trash2, X, Megaphone, Plus, Calendar, User, Loader2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "../config";
import { showToast } from "../lib/toast";
import { assetUrl } from "../lib/asset";
function AnnouncementCarouselAdmin({ items }) {
  const [index, setIndex] = React.useState(0)
  const touchStartX = React.useRef(null)
  const n = items.length

  const clamp = (i) => (i + n) % n
  const prev = () => setIndex((i) => clamp(i - 1))
  const next = () => setIndex((i) => clamp(i + 1))
  const go = (i) => setIndex(clamp(i))

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) { dx > 0 ? prev() : next() }
    touchStartX.current = null
  }

  const a = items[index] || {}
  const posted = (() => { try { return new Date(a.date_posted).toLocaleString() } catch { return a.date_posted || '' } })()
  const img = a.image_path ? assetUrl(a.image_path) : null
  const avatar = a.poster_profile_pic ? assetUrl(a.poster_profile_pic) : null

  const [lightbox, setLightbox] = React.useState(null)
  return (
    <div className="relative w-full" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
              <div className="text-xs text-gray-500 mt-1">{a.poster_name ? `By ${a.poster_name} • ` : ''}{posted}</div>
            </div>
          </div>
        </div>
        {a.content && (
          <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{a.content}</div>
        )}
        {img && (
          <div className="mt-3">
            <button type="button" onClick={() => setLightbox(img)} className="block w-full">
              <img src={img} alt="Announcement" className="w-full max-h-80 object-cover rounded border-2 border-black" />
            </button>
          </div>
        )}
      </div>

      {n > 1 && (
        <>
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-30 p-2 text-black hover:text-neutral-700 focus:outline-none pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-30 p-2 text-black hover:text-neutral-700 focus:outline-none pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6 text-black" />
          </button>

          <div className="flex items-center justify-center gap-2 py-3 z-20">
            {items.map((_, i) => (
              <span
                key={i}
                onClick={() => go(i)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer border ${i === index ? 'border-black bg-black' : 'border-black bg-transparent'}`}
              ></span>
            ))}
          </div>
        </>
      )}
      {lightbox && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={()=> setLightbox(null)}>
          <img src={lightbox} alt="full" className="max-w-[90vw] max-h-[85vh] object-contain rounded border bg-white" />
        </div>
      )}
    </div>
  )
}

export default function AdminAnnouncements() {
  const userId = localStorage.getItem("user_id");
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const showNotification = (message, type = 'success') => showToast(message, type);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}get_announcements.php`, { credentials: 'include' });
      const data = await response.json();
      setAnnouncements(Array.isArray(data) ? data : (data.announcements || []));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showNotification('❌ Failed to load announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const url = editingId
      ? `${BASE_URL}update_announcement.php`
      : `${BASE_URL}add_announcement.php`;

    const form = new FormData();
    form.append("title", formData.title);
    form.append("body", formData.body);
    form.append("user_id", userId);
    if (formData.image) form.append('image', formData.image);
    if (editingId) form.append("id", editingId);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: form,
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        showNotification('✅ ' + (editingId ? 'Announcement updated!' : 'Announcement posted!'));
        setFormData({ title: "", body: "" });
        setEditingId(null);
        fetchAnnouncements();
      } else {
        showNotification('❌ ' + (data.message || 'Operation failed'), 'error');
      }
    } catch (error) {
      console.error('Error submitting announcement:', error);
      showNotification('❌ Failed to save announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    
    setDeleting(id);
    const form = new FormData();
    form.append("id", id);
    form.append("user_id", userId);

    try {
      const response = await fetch(`${BASE_URL}delete_announcement.php`, {
        method: "POST",
        body: form,
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success !== false) {
        showNotification('✅ Announcement deleted');
        fetchAnnouncements();
      } else {
        showNotification('❌ Failed to delete announcement', 'error');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showNotification('❌ Failed to delete announcement', 'error');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading announcements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Community Announcements</h1>
          </div>
          <p className="text-gray-600">Share important updates with all residents</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Announcement" : "Create New Announcement"}
            </h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Enter announcement title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 100).trimStart() })}
                disabled={submitting}
                maxLength={100}
                required
              />
            </div>
            
            <div>
              <label htmlFor="announcement-body" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                id="announcement-body"
                name="body"
                placeholder="Write your announcement message here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                rows="4"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value.slice(0, 1000) })}
                disabled={submitting}
                maxLength={1000}
                required
              ></textarea>
            </div>

            {/* Image uploader */}
            <div>
              <label className="block text-sm font-medium text-black mb-1">Image (optional)</label>
              <div className="border-2 border-black rounded p-2 inline-block">
                <input type="file" accept="image/*" onChange={(e)=> setFormData({...formData, image: e.target.files?.[0]||null, preview: e.target.files?.[0]? URL.createObjectURL(e.target.files[0]) : null})} className="text-black" />
              </div>
              {formData.preview && <img src={formData.preview} alt="preview" className="h-20 mt-2 rounded border-2 border-black" />}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Posting...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {editingId ? 'Update Announcement' : 'Post Announcement'}
                    </>
                  )}
                </button>
                
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ title: "", body: "" });
                      setEditingId(null);
                    }}
                    disabled={submitting}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Preview Carousel */}
        {announcements.length > 0 && (
          <div className="relative w-full max-w-3xl mx-auto border rounded-2xl bg-white shadow-sm mb-8">
            <AnnouncementCarouselAdmin items={announcements} />
          </div>
        )}

      </div>
    </div>
  );
}
