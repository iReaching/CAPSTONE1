import React, { useState } from "react";
import { BASE_URL } from "../../config";
export default function SubmitReport() {
  const [formData, setFormData] = useState({
    message: "",
    block: "",
    lot: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("user_id");

    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("message", formData.message);
    payload.append("block", formData.block);
    payload.append("lot", formData.lot);

    fetch(`${BASE_URL}submit_report.php`, {
      method: "POST",
      body: payload
    })
      .then((res) => res.json())
      .then((res) => {
        alert(res.message || "Report submitted!");
        setFormData({ message: "", block: "", lot: "" });
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to submit report.");
      });
  };

  return (
    <div className="text-white max-w-3xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 text-center">Submit Report</h2>
      <div className="bg-white text-black rounded-lg shadow-lg p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              required
              className="w-full p-2 border rounded text-black"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Block</label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded text-black"
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
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}
