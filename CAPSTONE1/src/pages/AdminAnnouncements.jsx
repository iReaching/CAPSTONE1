import React, { useEffect, useState } from "react";
import { Pencil, Trash2, X, Megaphone, Plus, Calendar, User, Loader2, CheckCircle } from "lucide-react";
import { BASE_URL } from "../config";
import { showToast } from "../lib/toast";
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Announcements List */}
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No announcements yet</h3>
              <p className="text-gray-600">Create your first announcement to share with the community.</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{announcement.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Posted: {new Date(announcement.date_posted).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>By Admin</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{announcement.content}</p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setFormData({ title: announcement.title, body: announcement.content });
                        setEditingId(announcement.id);
                      }}
                      disabled={deleting === announcement.id}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Edit announcement"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      disabled={deleting === announcement.id}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete announcement"
                    >
                      {deleting === announcement.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
