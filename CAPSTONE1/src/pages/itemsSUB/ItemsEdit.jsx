import { useEffect, useState } from "react";

export default function ItemsEdit() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_items.php")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return alert("Please select an item first.");

    const formData = new FormData();
    formData.append("item_id", selectedId);
    formData.append("new_name", newName);
    formData.append("new_description", newDescription);
    if (newImage) formData.append("new_image", newImage);

    const res = await fetch("http://localhost/vitecap1/capstone1/php/edit_item.php", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      alert("Item updated successfully.");
      setSelectedId("");
      setNewName("");
      setNewDescription("");
      setNewImage(null);
      setPreview("");
    } else {
      alert("Update failed: " + result.message || result.error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">Edit Item</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Item */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black">Select Item</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full border px-3 py-2 rounded text-sm text-black"
            required
          >
            <option value="">-- Choose an item --</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black">New Name (optional)</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. New Item Name"
            className="w-full border px-3 py-2 rounded text-sm text-black"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-sm font-medium text-black">New Description (optional)</label>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="e.g. Updated item description..."
            className="w-full border px-3 py-2 rounded text-sm text-black"
            rows={3}
          />
        </div>

        {/* Image Upload */}
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
              htmlFor="edit-item-image-upload"
              className="cursor-pointer inline-block px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
            >
              {preview ? "Change Image" : "Upload New Image"}
              <input
                id="edit-item-image-upload"
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

        {/* Submit */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Update Item
          </button>
        </div>
      </form>
    </div>
  );
}
