import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Table, { THead, TR, TH, TBody, TD } from "../../components/ui/Table";
import Card, { CardContent } from "../../components/ui/Card";
import { UserCheck } from "lucide-react";
export default function VisitorLogHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");

  // New request form state (moved from EntryLogRequest)
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vehicle_plate: "",
    reason: "",
    expected_time: null,
    visitor_count: 1,
    package_details: "",
    homeowner_name: ""
  });

  useEffect(() => {
    // Prefill homeowner name
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => setFormData((p)=>({ ...p, homeowner_name: data.full_name || '' })))
        .catch(()=>{});
    }
    // Load logs
    fetch(`${BASE_URL}get_my_entrylogs.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [userId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("vehicle_plate", formData.vehicle_plate);
      payload.append("reason", formData.reason);
      payload.append("visitor_count", formData.visitor_count);
      payload.append("package_details", formData.package_details);
      payload.append("homeowner_name", formData.homeowner_name);
      payload.append("requested_by", userId);
      if (formData.expected_time) payload.append("expected_time", formData.expected_time.toTimeString().slice(0, 5));
      const res = await fetch(`${BASE_URL}request_entrylog.php`, { method:'POST', body: payload, credentials:'include' });
      const data = await res.json();
      // Simple toast
      const el=document.createElement('div'); el.className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded'; el.textContent=data.message||'Request sent'; document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
      setFormData({ ...formData, name:"", vehicle_plate:"", reason:"", expected_time:null, visitor_count:1, package_details:"" });
    } catch(e){ console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <Page>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Visitor Log History</h1>
              <p className="text-gray-600">Review past entry logs associated with your account</p>
            </div>
          </div>
        </div>

        {/* Request new visit */}
        <Card className="mb-6">
          <CardContent>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Request a Visit</h2>
            <form onSubmit={submitRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Visitor Name</label>
                  <input className="w-full border rounded px-3 py-2" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Vehicle Plate (optional)</label>
                  <input className="w-full border rounded px-3 py-2" name="vehicle_plate" value={formData.vehicle_plate} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Reason</label>
                <input className="w-full border rounded px-3 py-2" name="reason" value={formData.reason} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Visitors</label>
                  <input type="number" min={1} className="w-full border rounded px-3 py-2" name="visitor_count" value={formData.visitor_count} onChange={handleChange} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Package Details</label>
                  <input className="w-full border rounded px-3 py-2" name="package_details" value={formData.package_details} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Expected Arrival Time (optional)</label>
                <input type="time" className="w-full border rounded px-3 py-2" value={formData.expected_time ? formData.expected_time.toTimeString().slice(0,5) : ''} onChange={(e)=>{
                  const [h,m]=e.target.value.split(':');
                  const d=new Date(); d.setHours(+h||0, +m||0, 0, 0);
                  setFormData({ ...formData, expected_time: e.target.value? d : null });
                }} />
                <p className="mt-1 text-xs text-gray-500">Example: 14:30 (2:30 PM)</p>
              </div>
              <div className="text-right">
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">{submitting? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-500 italic">No visitor logs found.</div>
        ) : (
          <Card>
            <CardContent>
              <Table>
                <THead>
                  <TR>
                    <TH>Visitor Name</TH>
                    <TH>Reason</TH>
                    <TH>Vehicle Plate</TH>
                    <TH>Expected</TH>
                    <TH>Expected Time</TH>
                    <TH>Timestamp</TH>
                  </TR>
                </THead>
                <TBody>
                  {logs.map((log) => (
                    <TR key={log.id}>
                      <TD>{log.name}</TD>
                      <TD>{log.reason}</TD>
                      <TD>{log.vehicle_plate || "—"}</TD>
                      <TD>{log.expected === 1 ? "Yes" : "No"}</TD>
                      <TD>{log.expected_time || "—"}</TD>
                      <TD>{log.timestamp}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Page>
  );
}
