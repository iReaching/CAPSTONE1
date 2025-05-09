import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EntryLogRequest() {
  const [formData, setFormData] = useState({
    name: "",
    vehicle_plate: "",
    reason: "",
    expected_time: null, // Date object or null
  });

  const userId = localStorage.getItem("user_id");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("vehicle_plate", formData.vehicle_plate);
    payload.append("reason", formData.reason);
    payload.append("requested_by", userId);

    if (formData.expected_time) {
      payload.append(
        "expected_time",
        formData.expected_time.toTimeString().slice(0, 5) // "HH:MM"
      );
    }

    fetch("http://localhost/vitecap1/capstone1/php/request_entrylog.php", {
      method: "POST",
      body: payload,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Request sent!");
        setFormData({
          name: "",
          vehicle_plate: "",
          reason: "",
          expected_time: null,
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to submit entry log request.");
      });
  };

  return (
    <div className="text-white max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Request Entry Log</h2>
      <div className="bg-white text-black rounded-lg shadow-lg p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Visitor Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Vehicle Plate (optional)</label>
            <input
              type="text"
              name="vehicle_plate"
              value={formData.vehicle_plate}
              onChange={handleChange}
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Reason</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Expected Arrival Time (optional)</label>
            <DatePicker
              selected={formData.expected_time}
              onChange={(time) => setFormData({ ...formData, expected_time: time })}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Expected Time"
              dateFormat="HH:mm"
              className="w-full p-2 border rounded text-black"
            />
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
