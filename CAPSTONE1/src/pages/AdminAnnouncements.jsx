import React, { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { BASE_URL } from "../config";
export default function AdminAnnouncements() {
  const userId = localStorage.getItem("user_id");
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    fetch(`${BASE_URL}get_announcements.php`)
      .then((res) => res.json())
      .then((data) => setAnnouncements(data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = editingId
      ? `${BASE_URL}update_announcement.php`
      : `${BASE_URL}add_announcement.php`;

    const form = new FormData();
    form.append("title", formData.title);
    form.append("body", formData.body);
    form.append("user_id", userId);
    if (editingId) form.append("id", editingId);

    fetch(url, {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.success ? "Success!" : data.message);
        setFormData({ title: "", body: "" });
        setEditingId(null);
        fetchAnnouncements();
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    const form = new FormData();
    form.append("id", id);
    form.append("user_id", userId);

    fetch(`${BASE_URL}delete_announcement.php`, {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then(() => fetchAnnouncements());
  };

  return (
    <div className="w-full mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 text-indigo-500">Admin Announcements</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-100 text-black space-y-4 mb-8">
        <h3 className="font-semibold text-lg">{editingId ? "Edit" : "New"} Announcement</h3>
        <input
          type="text"
          name="title"
          placeholder="Announcement Title"
          className="w-full p-2 border rounded text-black"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          name="body"
          placeholder="Announcement Body"
          className="w-full p-2 border rounded text-black"
          rows="4"
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          required
        ></textarea>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update" : "Post"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setFormData({ title: "", body: "" });
                setEditingId(null);
              }}
              className="text-red-500 hover:underline"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* List of Announcements */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-center text-gray-400">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-100 text-black p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">{a.title}</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setFormData({ title: a.title, body: a.body });
                      setEditingId(a.id);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 mt-1">{a.body}</p>
              <p className="text-xs text-gray-500 mt-1">Posted: {a.date_posted}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
