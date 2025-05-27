import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
export default function VisitorLogHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
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

  return (
    <div className="text-white max-w-5xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-500">Visitor Log History</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-gray-400 italic">No visitor logs found.</p>
      ) : (
        <div className="overflow-x-auto bg-white text-black rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="px-4 py-2">Visitor Name</th>
                <th className="px-4 py-2">Reason</th>
                <th className="px-4 py-2">Vehicle Plate</th>
                <th className="px-4 py-2">Expected</th>
                <th className="px-4 py-2">Expected Time</th>
                <th className="px-4 py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t text-center">
                  <td className="px-4 py-2">{log.name}</td>
                  <td className="px-4 py-2">{log.reason}</td>
                  <td className="px-4 py-2">{log.vehicle_plate || "—"}</td>
                  <td className="px-4 py-2">
                    {log.expected === 1 ? (
                      <span className="text-green-700 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{log.expected_time || "—"}</td>
                  <td className="px-4 py-2">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
