import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BorrowAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [formData, setFormData] = useState({
    amenity_id: "",
    request_date: null,
    time_start: null,
    time_end: null,
    house_id: "",
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
    const homeownerId = localStorage.getItem("user_id");

    const payload = new FormData();
    payload.append("homeowner_id", homeownerId);
    payload.append("amenity_id", formData.amenity_id);
    payload.append("house_id", formData.house_id);
    payload.append("message", formData.message || "");

    if (formData.request_date)
      payload.append("request_date", formData.request_date.toISOString().split("T")[0]);

    if (formData.time_start)
      payload.append("time_start", formData.time_start.toTimeString().slice(0, 5));

    if (formData.time_end)
      payload.append("time_end", formData.time_end.toTimeString().slice(0, 5));

    fetch("http://localhost/vitecap1/capstone1/php/schedule_amenity.php", {
      method: "POST",
      body: payload,
    })
      .then((res) => res.json())
      .then((res) => {
        alert(res.message || "Request submitted!");
        setFormData({
          amenity_id: "",
          request_date: null,
          time_start: null,
          time_end: null,
          house_id: "",
          message: ""
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong.");
      });
  };

  return (

    <div className="text-white w-full mx-auto mt-10">
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
              <label className="block mb-1 font-semibold">Request Date</label>
              <DatePicker
                selected={formData.request_date}
                onChange={(date) => setFormData({ ...formData, request_date: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Time Start</label>
              <DatePicker
                selected={formData.time_start}
                onChange={(time) => setFormData({ ...formData, time_start: time })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Start"
                dateFormat="HH:mm"
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Time End</label>
              <DatePicker
                selected={formData.time_end}
                onChange={(time) => setFormData({ ...formData, time_end: time })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="End"
                dateFormat="HH:mm"
                className="w-full p-2 border rounded text-black"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">House ID</label>
            <input
              type="text"
              name="house_id"
              value={formData.house_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
            />
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
