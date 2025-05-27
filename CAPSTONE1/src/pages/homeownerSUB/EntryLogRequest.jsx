import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../../config";
export default function EntryLogRequest() {
  const [formData, setFormData] = useState({
    name: "",
    vehicle_plate: "",
    reason: "",
    expected_time: null,
    visitor_count: 1,
    package_details: "",
    homeowner_name: "", 
  });

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    // Fetch full name of the logged-in user to set as homeowner_name
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
            ...prev,
            homeowner_name: data.full_name || ""
          }));
        })
        .catch((err) => console.error("Failed to fetch profile:", err));
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("vehicle_plate", formData.vehicle_plate);
    payload.append("reason", formData.reason);
    payload.append("visitor_count", formData.visitor_count);
    payload.append("package_details", formData.package_details);
    payload.append("homeowner_name", formData.homeowner_name);
    payload.append("requested_by", userId);

    if (formData.expected_time) {
      payload.append(
        "expected_time",
        formData.expected_time.toTimeString().slice(0, 5)
      );
    }

    fetch(`${BASE_URL}request_entrylog.php`, {
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
          visitor_count: 1,
          package_details: "",
          homeowner_name: formData.homeowner_name, 
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to submit entry log request.");
      });
  };

  return (
    <div className="text-white max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-500">Request Entry Log</h2>
      <div className="p-6 max-w-3xl mx-auto bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-100 text-black">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-semibold">Visitor Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Vehicle Plate (optional)</label>
            <input
              type="text"
              name="vehicle_plate"
              value={formData.vehicle_plate}
              onChange={handleChange}
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
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
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Number of Visitors</label>
            <input
              type="number"
              name="visitor_count"
              value={formData.visitor_count}
              onChange={handleChange}
              min="1"
              required
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Package Details</label>
            <input
              type="text"
              name="package_details"
              value={formData.package_details}
              onChange={handleChange}
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Expected Arrival Time (optional)</label>
            <DatePicker
              selected={formData.expected_time}
              onChange={(time) =>
                setFormData({ ...formData, expected_time: time })
              }
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Expected Time"
              dateFormat="HH:mm"
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
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
