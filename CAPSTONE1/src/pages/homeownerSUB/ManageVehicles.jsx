import React, { useEffect, useState } from "react";
import { Pencil, Trash2, MoreVertical, X } from "lucide-react";
import { BASE_URL } from "../../config";

export default function ManageVehicles() {
  const userId = localStorage.getItem("user_id");
  const [vehicles, setVehicles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", type: "", color: "", plate: "" });
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = () => {
    fetch(`${BASE_URL}get_user_details.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => setVehicles(data.vehicles || []))
      .catch((err) => console.error("Failed to fetch vehicles", err));
  };

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setEditData({
      name: vehicle.name,
      type: vehicle.type_of_vehicle,
      color: vehicle.color,
      plate: vehicle.plate_number,
    });
    setDropdownOpenId(null);
  };

  const handleSave = (id) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("vehicle_name", editData.name);
    formData.append("vehicle_type", editData.type);
    formData.append("vehicle_color", editData.color);
    formData.append("vehicle_plate", editData.plate);

    fetch(`${BASE_URL}update_vehicle.php`, {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Vehicle updated.");
          setEditingId(null);
          fetchVehicles();
        } else {
          alert("Update failed.");
        }
      });
  };

  const handleDelete = (id) => {
    setDropdownOpenId(null);
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      const formData = new FormData();
      formData.append("id", id);

      fetch(`${BASE_URL}delete_vehicle.php`, {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Vehicle deleted.");
            fetchVehicles();
          } else {
            alert("Delete failed.");
          }
        });
    }
  };

  return (
    <div className="px-4 md:px-10 py-4 w-full max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-indigo-500">Manage Vehicles</h2>

      <div className="overflow-auto rounded-lg shadow bg-white text-black">
        <table className="w-full text-sm text-left bg-white text-black rounded shadow">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Color</th>
              <th className="px-4 py-2">Plate</th>
              <th className="px-4 py-2">Block & Lot</th>
              <th className="px-4 py-2">Photo</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b bg-white hover:bg-gray-100 transition">
                <td className="px-4 py-2">
                  {editingId === v.id ? (
                    <input
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="p-1 border rounded w-full text-black"
                    />
                  ) : (
                    v.name || "-"
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === v.id ? (
                    <input
                      value={editData.type}
                      onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                      className="p-1 border rounded w-full text-black"
                    />
                  ) : (
                    v.type
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === v.id ? (
                    <input
                      value={editData.color}
                      onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                      className="p-1 border rounded w-full text-black"
                    />
                  ) : (
                    v.color || "-"
                  )}
                </td>
                <td className="px-4 py-2">
                  {editingId === v.id ? (
                    <input
                      value={editData.plate}
                      onChange={(e) => setEditData({ ...editData, plate: e.target.value })}
                      className="p-1 border rounded w-full text-black"
                    />
                  ) : (
                    v.plate
                  )}
                </td>
                <td className="px-4 py-2">Block {v.block}, Lot {v.lot}</td>
                <td className="px-4 py-2">
                  {v.vehicle_pic_path ? (
                    <img
                      src={`${window.location.origin}/capstone1/${v.vehicle_pic_path}`}
                      alt="Vehicle"
                      className="w-14 h-10 object-cover rounded cursor-pointer border"
                      onClick={() => setSelectedImage(`${window.location.origin}/capstone1/${v.vehicle_pic_path}`)}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2 relative">
                  {editingId === v.id ? (
                    <button
                      onClick={() => handleSave(v.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <div
                        onClick={() => setDropdownOpenId((prev) => (prev === v.id ? null : v.id))}
                        className="cursor-pointer px-2 py-1 rounded hover:bg-gray-200 text-gray-600 hover:text-black inline-block"
                      >
                        <MoreVertical size={18} />
                      </div>

                      {dropdownOpenId === v.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white text-sm text-black rounded shadow-md z-50">
                          <ul>
                            <li>
                              <div
                                onClick={() => handleEdit(v)}
                                className="block w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                <Pencil size={14} className="inline-block mr-2" />
                                Edit
                              </div>
                            </li>
                            <li>
                              <div
                                onClick={() => handleDelete(v.id)}
                                className="block w-full px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
                              >
                                <Trash2 size={14} className="inline-block mr-2" />
                                Delete
                              </div>
                            </li>
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded shadow-xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X size={20} />
            </button>
            <img src={selectedImage} alt="Full Vehicle" className="max-w-full max-h-[80vh] rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
