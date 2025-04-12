import { useEffect, useState } from "react";

export default function AmenitySchedules() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_amenity_schedules.php")
      .then((res) => res.json())
      .then((data) => setRequests(data))
      .catch((err) => console.error("Failed to fetch schedules:", err));
  }, []);

  const handleAction = async (id, action) => {
    try {
      const res = await fetch("http://localhost/vitecap1/capstone1/php/update_schedule_status.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const result = await res.json();
      if (result.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: action } : req
          )
        );
      } else {
        alert("Failed to update request status.");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Amenity Schedule Requests</h1>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm text-center border">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-3 py-2">User ID</th>
              <th>Date</th>
              <th>Amenity</th>
              <th>Message</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-gray-500">
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="border-t">
                  <td className="px-3 py-2">{req.homeowner_id}</td>
                  <td className="px-3 py-2">{req.request_date}</td>
                  <td className="px-3 py-2">{req.amenity_name}</td>
                  <td className="px-3 py-2">{req.message}</td>
                  <td className="px-3 py-2">
                    {req.time_start} - {req.time_end}
                  </td>
                  <td className="px-3 py-2 capitalize">{req.status}</td>
                  <td className="px-3 py-2 space-x-2">
                    {req.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleAction(req.id, "approved")}
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, "rejected")}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-white ${
                          req.status === "approved"
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
