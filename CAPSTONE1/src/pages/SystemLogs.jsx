import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import Page from "../components/ui/Page";
import Table, { THead, TR, TH, TBody, TD } from "../components/ui/Table";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`${BASE_URL}get_logs.php`, { credentials: "include" })
      .then(async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { throw new Error("Invalid JSON"); }
      })
      .then((data) => {
        const arr = Array.isArray(data) ? data : (Array.isArray(data.logs) ? data.logs : []);
        setLogs(arr);
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err);
        setError("Failed to load logs.");
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Derived filters
  const filtered = logs.filter(l => {
    const s = search.trim().toLowerCase();
    const matchesSearch = !s || (
      (l.user_id || '').toLowerCase().includes(s) ||
      (l.description || '').toLowerCase().includes(s) ||
      (l.source_file || '').toLowerCase().includes(s)
    );
    const matchesAction = !action || (l.action_type || '').toLowerCase() === action.toLowerCase();
    const ts = new Date(l.timestamp);
    const afterFrom = !from || ts >= new Date(from);
    const beforeTo = !to || ts <= new Date(to + 'T23:59:59');
    return matchesSearch && matchesAction && afterFrom && beforeTo;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * perPage;
  const current = filtered.slice(start, start + perPage);

  return (
    <Page title="System Logs" description="Audit trail of key actions">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search by user/description/source and narrow by action/date</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between mb-4">
            <Input
              type="text"
              placeholder="Search user, description, or source file..."
              value={search}
              maxLength={160}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <div className="flex items-center gap-2">
              <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}>
                <option value="">All actions</option>
                <option value="insert">Insert</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="upload">Upload</option>
              </Select>
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </div>
          </div>

          {error && (
            <div className="mb-3 rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm ring-1 ring-red-200">{error}</div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-600">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-500 italic">No logs match your filters.</div>
          ) : (
            <>
              <Table>
                <THead>
                  <TR>
                    <TH>Timestamp</TH>
                    <TH>User ID</TH>
                    <TH>Action</TH>
                    <TH>Description</TH>
                    <TH>Source File</TH>
                  </TR>
                </THead>
                <TBody>
                  {current.map((log, idx) => (
                    <TR key={log.id} className={idx % 2 === 1 ? 'bg-gray-50' : undefined}>
                      <TD>{log.timestamp}</TD>
                      <TD>{log.user_id}</TD>
                      <TD className="capitalize">{log.action_type}</TD>
                      <TD>{log.description}</TD>
                      <TD>{log.source_file}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>

              <div className="flex items-center justify-between mt-4">
                <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pageSafe === 1}>Previous</Button>
                <div className="text-sm text-gray-600">Page {pageSafe} of {totalPages}</div>
                <Button variant="primary" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={pageSafe >= totalPages}>Next</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Page>
  );
}
