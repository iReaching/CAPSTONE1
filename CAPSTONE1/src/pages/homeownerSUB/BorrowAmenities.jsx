import React, { useEffect, useState } from "react";

export default function BorrowAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [formData, setFormData] = useState({
    amenity_id: "",
    date: "",
    time_start: "",
    time_end: "",
    message: ""
  });

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_amenities.php")
      .then((res) => res.json())
      .then((data) => setAmenities(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");
    const payload = new FormData();
    payload.append("user_id", userId);
    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    fetch("http://localhost/vitecap1/capstone1/php/schedule_amenity.php", {
      method: "POST",
      body: payload,
    })
      .then((res) => res.json())
      .then((res) => {
        alert(res.message || "Request submitted!");
        setFormData({
          amenity_id: "",
          date: "",
          time_start: "",
          time_end: "",
          message: ""
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong.");
      });
  };

  return (
    <div className="text-white max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Borrow Amenity</h2>
      <div className="bg-white text-black rounded-lg shadow-lg p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Select Amenity</label>
            <select
              name="amenity_id"
              value={formData.amenity_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
            >
              <option value="">-- Select --</option>
              {amenities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Time Start</label>
              <input
                type="time"
                name="time_start"
                value={formData.time_start}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Time End</label>
              <input
                type="time"
                name="time_end"
                value={formData.time_end}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded text-black"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Message (optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded text-black"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
