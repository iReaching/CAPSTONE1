import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { BASE_URL } from "../../config";
export default function AmenityEdit() {
  const [amenities, setAmenities] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = () => {
    fetch(`${BASE_URL}get_amenities.php`)
      .then((res) => res.json())
      .then((data) => setAmenities(data))
      .catch((err) => console.error("Error fetching amenities:", err));
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this amenity?");
    if (!confirmDelete) return;

    fetch(`${BASE_URL}delete_amenity.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id: selectedId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Amenity deleted.");
        setSelectedId("");
        setNewName("");
        setNewDescription("");
        setNewImage(null);
        setPreview("");
        fetchAmenities();
      })
      .catch((err) => {
        console.error("Deletion error:", err);
        alert("Something went wrong.");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("Select an amenity first.");

    const formData = new FormData();
    formData.append("amenity_id", selectedId);
    formData.append("new_name", newName);
    formData.append("new_description", newDescription);
    if (newImage) formData.append("new_image", newImage);

    const res = await fetch(`${BASE_URL}edit_amenity.php`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      alert("Amenity updated.");
      setSelectedId("");
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setPreview("");
      fetchAmenities();
    } else {
      alert("Update failed: " + result.message || result.error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-100">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">Edit Amenity</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-end gap-2">
          <div className="w-full">
            <label className="block mb-1 text-sm font-medium text-black">Select Amenity</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-100 text-indigo-500"
              required
            >
              <option value="">-- Choose an amenity --</option>
              {amenities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
            title="Delete amenity"
          >
            <Trash2 size={24} />
          </button>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-black">New Name (optional)</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full border px-3 py-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border-indigo-100 text-black"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-black">New Description (optional)</label>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full border px-3 py-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border-indigo-100 text-black"
            rows={3}
          />
        </div>

        <div className="flex justify-center mt-4">
          <div className="w-full max-w-xs text-center">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 mx-auto object-cover border border-gray-300 mb-3"
              />
            )}
            <label
              htmlFor="edit-image-upload"
              className="cursor-pointer inline-block px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
            >
              {preview ? "Change Image" : "Upload New Image"}
              <input
                id="edit-image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setNewImage(file);
                  setPreview(URL.createObjectURL(file));
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Update Amenity
          </button>
        </div>
      </form>
    </div>
  );
}
