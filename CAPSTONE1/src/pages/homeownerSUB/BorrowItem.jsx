import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../../config";
export default function BorrowItem() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_id: "",
    request_date: null,
    time_start: null,
    time_end: null,
    message: ""
  });

  useEffect(() => {
    fetch(`${BASE_URL}get_items.php`)
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const homeownerId = localStorage.getItem("user_id");

    const payload = new FormData();
    payload.append("user_id", homeownerId);
    payload.append("item_id", formData.item_id);
    payload.append("message", formData.message || "");

    if (formData.request_date)
      payload.append("request_date", formData.request_date.toISOString().split("T")[0]);

    if (formData.time_start)
      payload.append("time_start", formData.time_start.toTimeString().slice(0, 5));

    if (formData.time_end)
      payload.append("time_end", formData.time_end.toTimeString().slice(0, 5));

    fetch(`${BASE_URL}borrow_item.php`, {
      method: "POST",
      body: payload,
    })
      .then((res) => res.json())
      .then((res) => {
        alert(res.message || "Request submitted!");
        setFormData({
          item_id: "",
          request_date: null,
          time_start: null,
          time_end: null,
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
      <h2 className="text-3xl font-bold mb-8 text-center text-indigo-500">Borrow Item</h2>
      <div className="p-6 max-w-3xl mx-auto bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Select Item</label>
            <select
              name="item_id"
              value={formData.item_id}
              onChange={handleChange}
              required
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
            >
              <option value="">-- Select --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.available} available)
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
                className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
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
                className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
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
                className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
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
              className="w-full p-2 bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-200 text-black"
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
