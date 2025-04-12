import React, { useState, useEffect } from "react";

export default function Amenities() {
  const [tab, setTab] = useState("view");
  const [amenities, setAmenities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [editForm, setEditForm] = useState({
    amenity_id: "",
    new_name: "",
    new_description: "",
    new_image: null,
  });

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_amenities.php")
      .then((res) => res.json())
      .then((data) => setAmenities(data));
  
    fetch("http://localhost/vitecap1/capstone1/php/get_amenity_schedule.php")
      .then((res) => res.json())
      .then((data) => setRequests(data));
  }, []);

  
  const handleAction = async (id, action) => {
    const res = await fetch("http://localhost/vitecap1/capstone1/PHP/update_amenity_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
  
    const result = await res.json();
    if (result.success) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    }
  };
  

  const handleAdd = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.image);

    const res = await fetch("http://localhost/vitecap1/capstone1/PHP/add_amenity.php", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      alert("Amenity added!");
      window.location.reload();
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("amenity_id", editForm.amenity_id);
    formData.append("new_name", editForm.new_name);
    formData.append("new_description", editForm.new_description);
    if (editForm.new_image) formData.append("new_image", editForm.new_image);

    const res = await fetch("http://localhost/vitecap1/capstone1/PHP/edit_amenity.php", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      alert("Amenity updated!");
      window.location.reload();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Manage Amenities</h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-4">
        <button onClick={() => setTab("view")} className={`px-4 py-2 rounded ${tab === "view" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>View</button>
        <button onClick={() => setTab("add")} className={`px-4 py-2 rounded ${tab === "add" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Add</button>
        <button onClick={() => setTab("edit")} className={`px-4 py-2 rounded ${tab === "edit" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>Edit</button>
      </div>

      {/* VIEW */}
      {tab === "view" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {amenities.map((a) => (
            <div key={a.id} className="bg-white shadow rounded p-4">
              <img src={`http://localhost/vitecap1/capstone1/${a.image}`} alt={a.name} className="h-48 w-full object-cover rounded mb-3" />
              <h3 className="font-bold text-indigo-600">{a.name}</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* ADD */}
      {tab === "add" && (
        <form onSubmit={handleAdd} className="space-y-4 max-w-xl">
          <input
            type="text"
            placeholder="Amenity Name"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            rows="4"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="file"
            className="w-full border p-2 rounded"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            required
          />
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Add Amenity</button>
        </form>
      )}

      {/* EDIT */}
      {tab === "edit" && (
        <form onSubmit={handleEdit} className="space-y-4 max-w-xl">
          <select
            className="w-full border p-2 rounded"
            value={editForm.amenity_id}
            onChange={(e) => setEditForm({ ...editForm, amenity_id: e.target.value })}
            required
          >
            <option value="">Select Amenity</option>
            {amenities.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="New Name (optional)"
            className="w-full border p-2 rounded"
            value={editForm.new_name}
            onChange={(e) => setEditForm({ ...editForm, new_name: e.target.value })}
          />
          <textarea
            placeholder="New Description (optional)"
            className="w-full border p-2 rounded"
            rows="4"
            value={editForm.new_description}
            onChange={(e) => setEditForm({ ...editForm, new_description: e.target.value })}
          />
          <input
            type="file"
            className="w-full border p-2 rounded"
            onChange={(e) => setEditForm({ ...editForm, new_image: e.target.files[0] })}
          />
          <button type="submit" className="bg-yellow-500 text-white px-4 py-2 rounded">Update Amenity</button>
        </form>
      )}
    </div>
  );
}
