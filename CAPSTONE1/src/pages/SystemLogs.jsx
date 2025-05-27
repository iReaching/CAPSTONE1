import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
export default function SystemLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch(`${BASE_URL}get_logs.php`)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Error fetching logs:", err));
  }, []);

  return (
    <div className="text-white p-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-500">System Logs</h2>

      {logs.length === 0 ? (
        <p className="text-gray-400 italic">No logs available.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm bg-white text-black rounded shadow">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="px-4 py-2 text-left">Timestamp</th>
                <th className="px-4 py-2 text-left">User ID</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Source File</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="px-4 py-2">{log.timestamp}</td>
                  <td className="px-4 py-2">{log.user_id}</td>
                  <td className="px-4 py-2 capitalize">{log.action_type}</td>
                  <td className="px-4 py-2">{log.description}</td>
                  <td className="px-4 py-2">{log.source_file}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
