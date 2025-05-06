import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function BorrowItem() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    item_id: "",
    quantity: 1,
    borrow_date: null,
    return_date: null,    
    purpose: ""
  });

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_items.php")
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");
    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("item_id", formData.item_id);
    payload.append("quantity", formData.quantity);
    payload.append("purpose", formData.purpose || "");
    
    if (formData.borrow_date)
      payload.append("borrow_date", formData.borrow_date.toISOString().split("T")[0]);
    
    if (formData.return_date)
      payload.append("return_date", formData.return_date.toISOString().split("T")[0]);
    

    fetch("http://localhost/vitecap1/capstone1/php/borrow_item.php", {
      method: "POST",
      body: payload,
    })
      .then((res) => res.json())
      .then((res) => {
        alert(res.message || "Request submitted!");
        setFormData({
          item_id: "",
          quantity: 1,
          borrow_date: "",
          return_date: "",
          purpose: ""
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Something went wrong.");
      });
  };

  return (
    <div className="text-white max-w-4xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Borrow Item</h2>
      <div className="bg-white text-black rounded-lg shadow-lg p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Select Item</label>
            <select
              name="item_id"
              value={formData.item_id}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded text-black"
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
              <label className="block mb-1 font-semibold">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                min={1}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Date</label>
              <DatePicker
                selected={formData.borrow_date}
                onChange={(date) => setFormData({ ...formData, borrow_date: date })}
                dateFormat="yyyy-MM-dd"
                className="w-full p-2 border rounded text-black"
              />
            </div>
            <div>
            <label className="block mb-1 font-semibold">Return Date</label>
            <DatePicker
              selected={formData.borrow_date}
              onChange={(date) => setFormData({ ...formData, return_date: date })}
              dateFormat="yyyy-MM-dd"
              className="w-full p-2 border rounded text-black"
            />
          </div>
        </div>



          <div>
            <label className="block mb-1 font-semibold">Purpose (optional)</label>
            <textarea
              name="purpose"
              value={formData.purpose}
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
