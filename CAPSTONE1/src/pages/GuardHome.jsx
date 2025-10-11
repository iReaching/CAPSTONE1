import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../config";
import Page from "../components/ui/Page";
import Card, { CardContent } from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import AnnouncementsPanel from "../components/AnnouncementsPanel";

export default function GuardHome() {
  const [preview, setPreview] = useState("");
  const [entryLogs, setEntryLogs] = useState([]);
  const [homeowners, setHomeowners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: 1, role: "guard", sortField: "timestamp", sort: "DESC" });
      const res = await fetch(`${BASE_URL}get_entry_logs.php?${params.toString()}`, { credentials: 'include' });
      const text = await res.text();
      const data = JSON.parse(text);
      setEntryLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (e) {
      console.error('Failed to fetch entry logs', e);
      setEntryLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHomeowners = async () => {
    try {
      const res = await fetch(`${BASE_URL}get_homeowners.php`, { credentials: 'include' });
      const text = await res.text();
      const data = JSON.parse(text);
      setHomeowners(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch homeowners', e);
      setHomeowners([]);
    }
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
    setSubmitting(true);
    const data = new FormData();

    for (let key in formData) {
      if (key === "expected_time" && formData.expected_time) {
        data.append("expected_time", formData.expected_time.toTimeString().slice(0, 5));
      } else if (key === "expected") {
        data.append("expected", formData.expected ? 'true' : 'false');
      } else if (key !== "expected_time") {
        data.append(key, formData[key]);
      }
    }

    try {
      const res = await fetch(`${BASE_URL}add_entrylog.php`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      });
      const text = await res.text();
      let payload;
      try { payload = JSON.parse(text); } catch { payload = { status: 'success' }; }
      if (payload.status === 'success' || payload.success) {
        import("../lib/toast").then(({ showToast }) => showToast("Entry log submitted successfully!"));
        fetchLogs();
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
      } else {
        import("../lib/toast").then(({ showToast }) => showToast(payload.message || "Error submitting entry log.", 'error'));
      }
    } catch (err) {
      console.error("POST error:", err);
      import("../lib/toast").then(({ showToast }) => showToast("Error submitting entry log.", 'error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    const formData = new FormData();
    formData.append("id", id);
    try {
      const res = await fetch(`${BASE_URL}delete_entry_log.php`, { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        import("../lib/toast").then(({ showToast }) => showToast("Entry deleted."));
      } else {
        import("../lib/toast").then(({ showToast }) => showToast("Failed to delete entry.", 'error'));
      }
    } catch (e) {
      import("../lib/toast").then(({ showToast }) => showToast("Failed to delete entry.", 'error'));
    }
    fetchLogs();
  };

  return (
    <Page title="Entry Log Submission" description="Security can record visitor entries here">
      <AnnouncementsPanel role="guard" showViewAll={false} className="mb-6" />
      {loading && (
        <div className="text-gray-600 bg-white/50 border rounded px-4 py-2 mb-4">Loading recent logs...</div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
              <Input name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate (optional)</label>
              <Input name="vehicle_plate" value={formData.vehicle_plate} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <Input name="reason" value={formData.reason} onChange={handleChange} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Visitors</label>
              <Input type="number" name="visitor_count" value={formData.visitor_count} onChange={handleChange} min={1} required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Details</label>
              <Input type="text" name="package_details" value={formData.package_details} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor is going to:</label>
              <Select name="homeowner_name" value={formData.homeowner_name} onChange={handleChange} required>
                <option value="">-- Select Homeowner --</option>
                {homeowners.map((h, i) => (
                  <option key={i} value={h.full_name}>{h.full_name}</option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-3">
              {preview && <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded border" />}
              <label htmlFor="id_photo" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100">
                Upload ID Photo
                <input id="id_photo" type="file" name="id_photo" accept="image/*" onChange={handleChange} className="hidden" />
              </label>
            </div>

            <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Log'}</Button>
          </form>
        </CardContent>
      </Card>
    </Page>
  );
}
