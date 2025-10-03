import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
import Page from "../components/ui/Page";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Table, { THead, TR, TH, TBody, TD } from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { showToast } from "../lib/toast";

export default function EntryLog() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [columns, setColumns] = useState({
    name: true,
    visitor_count: true,
    package_details: true,
    homeowner_name: true,
    vehicle_plate: true,
    reason: true,
    timestamp: true,
    requested_by: true,
    expected: true,
    id_photo_path: true,
    actions: true,
  });

  const fetchLogs = () => {
    const params = new URLSearchParams({ page, search, role, sort: sortOrder, sortField });
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    setLoading(true);
    setError("");
    fetch(`${BASE_URL}get_entry_logs.php?${params.toString()}`, { credentials: "include" })
      .then(async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON from server");
        }
      })
      .then((data) => {
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotal(Number(data.total || 0));
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load logs.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, role, sortField, sortOrder, fromDate, toDate]);

  // Persist column toggles
  useEffect(() => {
    try {
      const saved = localStorage.getItem('entrylog_columns');
      if (saved) setColumns(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('entrylog_columns', JSON.stringify(columns)); } catch {}
  }, [columns]);

  const handleDelete = (id) => {
    setDeleteTarget(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setDeleting(true);
    fetch(`${BASE_URL}delete_entry_log.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id: deleteTarget }),
      credentials: "include",
    })
      .then(async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { throw new Error("Invalid JSON from server"); }
      })
      .then((data) => {
          if (data.success) {
          showToast("Entry deleted.");
          setDeleteModalOpen(false);
          setDeleteTarget(null);
          fetchLogs();
        } else {
          showToast("Delete failed: " + (data.message || ""), 'error');
        }
      })
      .catch(() => {
        showToast("Delete request failed.", 'error');
      })
      .finally(() => setDeleting(false));
  };

  const exportCSV = async () => {
    try {
      setExporting(true);
      const perPage = 10; // backend uses 10
      const totalPages = Math.max(1, Math.ceil((Number(total) || 0) / perPage));
      const all = [];
      for (let p = 1; p <= totalPages; p++) {
        const params = new URLSearchParams({ page: String(p), search, role, sort: sortOrder, sortField });
        if (fromDate) params.set('from', fromDate);
        if (toDate) params.set('to', toDate);
        // eslint-disable-next-line no-await-in-loop
        const data = await fetch(`${BASE_URL}get_entry_logs.php?${params.toString()}`, { credentials: 'include' })
          .then(async (res) => {
            const text = await res.text();
            try { return JSON.parse(text); } catch { throw new Error('Invalid JSON from server'); }
          });
        const arr = Array.isArray(data.logs) ? data.logs : [];
        all.push(...arr);
      }
      const cols = [
        { key: 'name', label: 'Name' },
        { key: 'visitor_count', label: 'Visitors' },
        { key: 'package_details', label: 'Package' },
        { key: 'homeowner_name', label: 'Homeowner' },
        { key: 'vehicle_plate', label: 'Plate' },
        { key: 'reason', label: 'Reason' },
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'requested_by', label: 'Requested By' },
        { key: 'expected', label: 'Expected' },
        { key: 'id_photo_path', label: 'ID Photo Path' },
      ].filter(c => columns[c.key]);

      const header = cols.map(c => csvEscape(c.label)).join(',');
      const rows = all.map(item => cols.map(c => {
        let v = item[c.key];
        if (c.key === 'expected') v = (item.expected === 1 || item.expected === '1') ? 'Yes' : 'No';
        return csvEscape(v);
      }).join(','));
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `entry_logs_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      import("../lib/toast").then(({ showToast }) => showToast(`Exported ${all.length} rows.`));
    } catch (e) {
      console.error(e);
      import("../lib/toast").then(({ showToast }) => showToast("CSV export failed.", 'error'));
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setViewModalOpen(true);
  };

  const totalPages = Math.ceil(total / 10) || 1;

  return (
    <Page title="Entry Log" description="Search and review visitor entries">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search, filter by role, and sort results</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters + Sort */}
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex-1">
                <Input
                  placeholder="Search name or plate..."
                  value={search}
                  maxLength={120}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All roles</option>
                  <option value="homeowner">Homeowner</option>
                </Select>
                <Select
                  value={`${sortField}_${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("_");
                    setSortField(field);
                    setSortOrder(order);
                    setPage(1);
                  }}
                >
                  <option value="timestamp_DESC">Newest First</option>
                  <option value="timestamp_ASC">Oldest First</option>
                  <option value="name_ASC">Name A–Z</option>
                  <option value="name_DESC">Name Z–A</option>
                </Select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">From <span className="text-xs text-gray-500">(e.g., 2025-10-02)</span></label>
                <Input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">To <span className="text-xs text-gray-500">(e.g., 2025-10-15)</span></label>
                <Input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => exportCSV()} disabled={exporting}>{exporting ? 'Exporting…' : 'Export CSV'}</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="text-xs text-gray-600">Columns:</div>
              {[
                {key:'name', label:'Name'},
                {key:'visitor_count', label:'Visitors'},
                {key:'package_details', label:'Package'},
                {key:'homeowner_name', label:'Homeowner'},
                {key:'vehicle_plate', label:'Plate'},
                {key:'reason', label:'Reason'},
                {key:'timestamp', label:'Timestamp'},
                {key:'requested_by', label:'Requested By'},
                {key:'expected', label:'Expected'},
                {key:'id_photo_path', label:'ID Photo'},
                {key:'actions', label:'Actions'},
              ].map(col => (
                <label key={col.key} className="flex items-center gap-1 text-xs">
                  <input type="checkbox" checked={!!columns[col.key]} onChange={(e) => setColumns((c) => ({...c, [col.key]: e.target.checked}))} />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm ring-1 ring-red-200">
              {error}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-600">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-500 italic">No entry logs found.</div>
          ) : (
          <Table>
            <THead>
              <TR>
                {columns.name && <TH>Name</TH>}
                {columns.visitor_count && <TH>Visitors</TH>}
                {columns.package_details && <TH>Package</TH>}
                {columns.homeowner_name && <TH>Homeowner</TH>}
                {columns.vehicle_plate && <TH>Plate</TH>}
                {columns.reason && <TH>Reason</TH>}
                {columns.timestamp && <TH>Timestamp</TH>}
                {columns.requested_by && <TH>Requested By</TH>}
                {columns.expected && <TH>Expected</TH>}
                {columns.id_photo_path && <TH>ID Photo</TH>}
                {columns.actions && <TH className="text-right">Actions</TH>}
              </TR>
            </THead>
            <TBody>
              {logs.map((log, idx) => (
                <TR
                  key={log.id}
                  className={
                    (log.expected === "1" || log.expected === 1)
                      ? "bg-yellow-50"
                      : (idx % 2 === 1 ? "bg-gray-50" : undefined)
                  }
                >
                  {columns.name && <TD>{log.name}</TD>}
                  {columns.visitor_count && <TD>{log.visitor_count}</TD>}
                  {columns.package_details && <TD>{log.package_details}</TD>}
                  {columns.homeowner_name && <TD>{log.homeowner_name}</TD>}
                  {columns.vehicle_plate && <TD>{log.vehicle_plate}</TD>}
                  {columns.reason && <TD>{log.reason}</TD>}
                  {columns.timestamp && <TD>{log.timestamp}</TD>}
                  {columns.requested_by && <TD>{log.requested_by}</TD>}
                  {columns.expected && (
                    <TD>
                      {log.expected === 1 || log.expected === "1" ? (
                        <Badge variant="gray">Expected</Badge>
                      ) : (
                        "-"
                      )}
                    </TD>
                  )}
                  {columns.id_photo_path && (
                    <TD>
                      {log.id_photo_path ? (
                        <img src={assetUrl(log.id_photo_path)} alt="ID" className="w-12 h-12 object-cover rounded" />
                      ) : (
                        "-"
                      )}
                    </TD>
                  )}
                  {columns.actions && (
                    <TD className="text-right">
                      <div className="inline-flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleViewDetails(log)}>
                          View
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(log.id)}>
                          Delete
                        </Button>
                      </div>
                    </TD>
                  )}
                </TR>
              ))}
            </TBody>
          </Table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <div className="text-sm text-gray-600">Page {page} of {totalPages}</div>
            <Button variant="primary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* View Modal */}
      {viewModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-xl w-full shadow-lg relative">
            <button onClick={() => setViewModalOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl" aria-label="Close details">
              &times;
            </button>

            <h3 className="text-xl font-bold mb-4">Entry Log Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {selectedLog.name}</p>
              <p><strong>Visitor Count:</strong> {selectedLog.visitor_count}</p>
              <p><strong>Package Details:</strong> {selectedLog.package_details}</p>
              <p><strong>Homeowner Visited:</strong> {selectedLog.homeowner_name}</p>
              <p><strong>Entry Type:</strong> {selectedLog.entry_type}</p>
              <p><strong>Vehicle Plate:</strong> {selectedLog.vehicle_plate}</p>
              <p><strong>Reason:</strong> {selectedLog.reason}</p>
              <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
              <p><strong>Requested By:</strong> {selectedLog.requested_by}</p>
              <p><strong>Expected:</strong> {selectedLog.expected === 1 ? "Yes" : "No"}</p>
              <p><strong>Expected Time:</strong> {selectedLog.expected_time || "-"}</p>
            </div>

            {selectedLog.id_photo_path && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Uploaded ID Photo:</p>
                <img src={assetUrl(selectedLog.id_photo_path)} alt="ID" className="w-full max-h-[400px] object-contain border rounded" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-md w-full shadow-lg">
            <h3 className="text-lg font-semibold">Delete entry?</h3>
            <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => { if (!deleting) { setDeleteModalOpen(false); setDeleteTarget(null); } }} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

// Helper: Export CSV for current filters (fetches all pages)
function csvEscape(val) {
  if (val == null) return '';
  const s = String(val).replace(/"/g, '""');
  if (/[",\n]/.test(s)) return '"' + s + '"';
  return s;
}
