import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function GuardHome() {
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    entry_type: "Guest",
    vehicle_plate: "",
    reason: "",
    expected: false,
    expected_time: null,
    id_photo: null,
  });
  const [preview, setPreview] = useState("");
  const [entryLogs, setEntryLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get("http://localhost/vitecap1/capstone1/PHP/get_entry_logs.php?...", {
      params: {
        page: 1,
        role: "guard",
        sortField: "timestamp",
        sort: "DESC",
      },
    });
    setEntryLogs(res.data.logs);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, id_photo: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const data = new FormData();
  
    // Copy all fields except expected_time
    for (let key in formData) {
      if (key !== "expected_time") {
        data.append(key, formData[key]);
      }
    }
  
  
    await axios.post("http://localhost/vitecap1/capstone1/PHP/add_entrylog.php", data);

    // Show success message
    setSuccessMsg("Entry log submitted successfully!");
    
    fetchLogs(); // refresh table
    
    // Clear form after 1.5s
    setTimeout(() => {
      setFormData({
        name: "",
        entry_type: "Entry",
        vehicle_plate: "",
        reason: "",
        id_photo: null,
      });
      setPreview("");
      setSuccessMsg(""); // clear the message
    }, 1500);
    
    setPreview("");
  };
  

  const handleDelete = async (id) => {
    const formData = new FormData();
    formData.append("id", id);
    await axios.post("http://localhost/vitecap1/capstone1/PHP/delete_entry_log.php", formData);
    fetchLogs();
  };

  return (
    <div className="p-6 max-w mx-auto bg-white rounded shadow space-y-10">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">Entry Log Submission</h2>
      {successMsg && (
  <div className="text-green-600 bg-green-100 border border-green-400 rounded px-4 py-2">
    {successMsg}
  </div>
)}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
          <input
            className="w-full px-3 py-2 border rounded border-black text-sm text-black"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Entry Type</label>
          <select
            name="entry_type"
            value={formData.entry_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded border-black text-sm text-black"
            required
          >
            <option value="">-- Select Entry Type --</option>
            <option value="Entry">Entry</option>
            <option value="Exit">Exit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate (optional)</label>
          <input
            className="w-full px-3 py-2 border rounded border-black text-sm text-black"
            name="vehicle_plate"
            value={formData.vehicle_plate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
          <input
            className="w-full px-3 py-2 border rounded border-black text-sm text-black"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
          />
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
              htmlFor="id_photo"
              className="cursor-pointer inline-block px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
            >
              {preview ? "Change ID Photo" : "Upload ID Photo"}
              <input
                id="id_photo"
                type="file"
                name="id_photo"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                required
              />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Submit Log
        </button>
      </form>
    </div>
  );
}
