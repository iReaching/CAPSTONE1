import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
export default function EntryLog() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = () => {
    const params = new URLSearchParams({
      page,
      search,
      role,
      sort: sortOrder,
      sortField,
    });

    fetch(`${BASE_URL}get_entry_logs.php?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs);
        setTotal(data.total);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, role, sortField, sortOrder]);

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      fetch(`${BASE_URL}delete_entry_log.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            alert("Entry deleted.");
            fetchLogs();
          } else {
            alert("Delete failed: " + data.message);
          }
        });
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setViewModalOpen(true);
  };

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Entry Log</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search name or plate..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full md:max-w-3xl px-3 py-2 border border-gray-400 rounded text-white"
        />

        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-400 rounded text-gray-500"
        >
          <option value="">Select Role</option>
          <option value="homeowner">Homeowner</option>
        </select>
      </div>

      {/* Sort Controls */}
      <div className="flex justify-end mb-4">
        <select
          value={sortField + "_" + sortOrder}
          onChange={(e) => {
            const [field, order] = e.target.value.split("_");
            setSortField(field);
            setSortOrder(order);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-400 rounded text-gray-500"
        >
          <option value="timestamp_DESC">Newest First</option>
          <option value="timestamp_ASC">Oldest First</option>
          <option value="name_ASC">Name A-Z</option>
          <option value="name_DESC">Name Z-A</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left bg-white text-black rounded shadow">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Visitor Count</th>
              <th className="px-4 py-2">Package Details</th>
              <th className="px-4 py-2">Homeowner</th>
              <th className="px-4 py-2">Plate</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2">Requested By</th>
              <th className="px-4 py-2">Expected</th>
              <th className="px-4 py-2">ID Photo</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr
                key={log.id}
                className={`border-b ${log.expected === "1" ? "bg-yellow-100" : "bg-white"}`}
              >
                <td className="px-4 py-2">{log.name}</td>
                <td className="px-4 py-2">{log.visitor_count}</td>
                <td className="px-4 py-2">{log.package_details}</td>
                <td className="px-4 py-2">{log.homeowner_name}</td>
                <td className="px-4 py-2">{log.vehicle_plate}</td>
                <td className="px-4 py-2">{log.reason}</td>
                <td className="px-4 py-2">{log.timestamp}</td>
                <td className="px-4 py-2">{log.requested_by}</td>
                <td className="px-4 py-2">
                  {log.expected === 1 || log.expected === "1" ? (
                    <span className="text-yellow-800 font-semibold">Expected</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2">
                  {log.id_photo_path ? (
                    <img
                      src={`${window.location.origin}capstone1/${log.id_photo_path}`}
                      alt="ID"
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2 relative">
                  <div
                    onClick={() => setDropdownOpen((prev) => (prev === log.id ? null : log.id))}
                    className="cursor-pointer px-2 py-1 rounded hover:bg-gray-200 text-gray-600 hover:text-black inline-block"
                  >
                    ⋮
                  </div>
                  {dropdownOpen === log.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white text-sm text-black rounded shadow-md z-10">
                      <ul>
                        <li>
                          <div
                            onClick={() => handleViewDetails(log)}
                            className="block w-full px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            View Details
                          </div>
                        </li>
                        <li>
                          <div
                            onClick={() => handleDelete(log.id)}
                            className="block w-full px-4 py-2 hover:bg-red-100 text-red-600 cursor-pointer"
                          >
                            Delete
                          </div>
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
        >
          Previous
        </button>
        <p className="text-sm text-white">
          Page {page} of {Math.ceil(total / 10)}
        </p>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= Math.ceil(total / 10)}
          className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-xl w-full shadow-lg relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
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
                <img
                  src={`${window.location.origin}capstone1/${selectedLog.id_photo_path}`}
                  alt="ID"
                  className="w-full max-h-[400px] object-contain border rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
