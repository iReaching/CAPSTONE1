import { useState } from "react";
import { BASE_URL } from "../../config";
export default function AmenityAdd() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`${BASE_URL}add_amenity.php`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        alert("Amenity added successfully!");
        setName("");
        setDescription("");
        setImage(null);
      } else {
        alert("Error: " + result.message || "Failed to add amenity.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-100">
      <h2 className="text-xl font-bold mb-4 text-indigo-600">Add New Amenity</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amenity Name</label>
          <input
            type="text"
            className="w-full border px-3 py-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border-indigo-100 text-black"
            placeholder="e.g. Swimming Pool"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full border px-3 py-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border-indigo-100 text-black"
            placeholder="Enter the amenity's description here."
            rows="10"
          ></textarea>
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
              htmlFor="image-upload"
              className="cursor-pointer inline-block px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
            >
              {preview ? "Change Image" : "Upload Image"}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImage(file);
                  setPreview(URL.createObjectURL(file));
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>


        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Add Amenity
        </button>
      </form>
    </div>
  );
}
