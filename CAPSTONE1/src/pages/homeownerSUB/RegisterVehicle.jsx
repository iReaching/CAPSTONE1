import React, { useState } from "react";

export default function RegisterVehicle() {
  const [formData, setFormData] = useState({
    name: "",
    color: "",
    type_of_vehicle: "",
    plate_number: "",
    block: "",
    lot: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");
    const payload = new FormData();

    payload.append("user_id", userId);
    payload.append("name", formData.name);
    payload.append("color", formData.color);
    payload.append("type_of_vehicle", formData.type_of_vehicle);
    payload.append("plate_number", formData.plate_number);
    payload.append("block", formData.block);
    payload.append("lot", formData.lot);
    if (formData.image) {
      payload.append("image", formData.image);
    }

    try {
      const res = await fetch("http://localhost/vitecap1/capstone1/php/submit_vehicle.php", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      alert(data.message || "Vehicle registered successfully.");
      setFormData({
        name: "",
        color: "",
        type_of_vehicle: "",
        plate_number: "",
        block: "",
        lot: "",
        image: null
      });
    } catch (err) {
      console.error(err);
      alert("Vehicle registration failed.");
    }
  };

  return (
    <div className="text-white max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Register Vehicle</h2>
      <div className="bg-white text-black rounded-lg shadow-lg p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-semibold">Owner's Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
              placeholder="e.g., Juan Dela Cruz"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Vehicle Color</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
              placeholder="e.g., Red"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Vehicle Type</label>
            <input
              type="text"
              name="type_of_vehicle"
              value={formData.type_of_vehicle}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
              placeholder="e.g., Car, Motorcycle"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Plate Number</label>
            <input
              type="text"
              name="plate_number"
              value={formData.plate_number}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
              placeholder="e.g., ABC-1234"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Block</label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded text-black"
                placeholder="e.g., B2"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Lot</label>
              <input
                type="text"
                name="lot"
                value={formData.lot}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded text-black"
                placeholder="e.g., L5"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Upload Vehicle Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Register Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}
