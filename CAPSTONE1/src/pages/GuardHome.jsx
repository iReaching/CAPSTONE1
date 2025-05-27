import { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../config";
export default function GuardHome() {
  const [successMsg, setSuccessMsg] = useState("");
  const [preview, setPreview] = useState("");
  const [entryLogs, setEntryLogs] = useState([]);
  const [homeowners, setHomeowners] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    vehicle_plate: "",
    reason: "",
    expected: false,
    expected_time: null,
    id_photo: null,
    visitor_count: 1,
    package_details: "",
    homeowner_name: "",
  });

  useEffect(() => {
    fetchLogs();
    fetchHomeowners();
  }, []);

  const fetchLogs = async () => {
    const res = await axios.get(`${BASE_URL}get_entry_logs.php`, {
      params: {
        page: 1,
        role: "guard",
        sortField: "timestamp",
        sort: "DESC",
      },
    });
    setEntryLogs(res.data.logs);
  };

  const fetchHomeowners = async () => {
    const res = await axios.get(`${BASE_URL}get_homeowners.php`);
    setHomeowners(res.data);
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

    for (let key in formData) {
      if (key === "expected_time" && formData.expected_time) {
        data.append("expected_time", formData.expected_time.toTimeString().slice(0, 5));
      } else if (key !== "expected_time") {
        data.append(key, formData[key]);
      }
    }

    console.log("Submitting form...");
    await axios.post(`${BASE_URL}add_entrylog.php`, data)
    .then(res => console.log("Response:", res.data))
    .catch(err => {
    console.error("POST error:", err);
    alert("Error submitting entry log.");
  });
    setSuccessMsg("Entry log submitted successfully!");
    fetchLogs();

    setTimeout(() => {
      setFormData({
        name: "",
        vehicle_plate: "",
        reason: "",
        expected: false,
        expected_time: null,
        id_photo: null,
        visitor_count: 1,
        package_details: "",
        homeowner_name: "",
      });
      setPreview("");
      setSuccessMsg("");
    }, 1500);
  };

  const handleDelete = async (id) => {
    const formData = new FormData();
    formData.append("id", id);
    await axios.post(`${BASE_URL}delete_entry_log.php`, formData);
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Visitors</label>
          <input
            type="number"
            name="visitor_count"
            value={formData.visitor_count}
            onChange={handleChange}
            min="1"
            required
            className="w-full px-3 py-2 border rounded border-black text-sm text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Package Details</label>
          <input
            type="text"
            name="package_details"
            value={formData.package_details}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded border-black text-sm text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visitor is going to:</label>
          <select
            name="homeowner_name"
            value={formData.homeowner_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded border-black text-sm text-black"
          >
            <option value="">-- Select Homeowner --</option>
            {homeowners.map((h, i) => (
              <option key={i} value={h.full_name}>{h.full_name}</option>
            ))}
          </select>
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
