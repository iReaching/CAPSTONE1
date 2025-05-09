import { useEffect, useState } from "react";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_reports.php")
      .then((res) => res.json())
      .then((data) => setReports(data))
      .catch((err) => console.error("Error fetching reports:", err));
  }, []);

  const handleResolve = (id) => {
    fetch("http://localhost/vitecap1/capstone1/php/update_report_status.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
          );
        } else {
          alert("Failed to resolve report.");
        }
      });
  };

  const filteredReports =
    activeTab === "pending"
      ? reports.filter((r) => r.status === "pending" || r.status === "ongoing")
      : reports.filter((r) => r.status === "resolved");


  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Maintenance Reports</h2>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "pending"
              ? "bg-indigo-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("pending")}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "resolved"
              ? "bg-indigo-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("resolved")}
        >
          Resolved
        </button>
      </div>

      {/* No reports */}
      {filteredReports.length === 0 ? (
        <p className="text-gray-400 italic">No {activeTab} reports found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className={`rounded-lg shadow-md p-4 ${
                report.status === "pending" || report.status === "ongoing"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <h3 className="font-bold text-lg mb-2">Block {report.block}, Lot {report.lot}</h3>
              <p className="text-sm mb-1">
                <span className="font-medium">Message:</span> {report.message}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Date Submitted:</span>{" "}
                {report.date_submitted}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </p>

              {(report.status === "pending" || report.status === "ongoing") && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
