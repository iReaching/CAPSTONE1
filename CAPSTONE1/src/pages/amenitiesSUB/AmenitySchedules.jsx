import React, { useEffect, useState } from "react";

export default function AmenitySchedules() {
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_amenity_schedules.php")
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((err) => console.error("Error fetching amenity schedules:", err));
  }, []);

  const handleUpdateStatus = (id, status) => {
    fetch("http://localhost/vitecap1/capstone1/php/update_amenity_status.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id, status }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchedules((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status } : s))
          );
        } else {
          alert("Failed to update amenity status.");
        }
      });
  };

  const filteredSchedules =
    activeTab === "pending"
      ? schedules.filter((s) => s.status === "pending")
      : schedules.filter((s) => s.status === "approved" || s.status === "rejected");

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6">Amenity Schedules</h2>

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
            activeTab !== "pending"
              ? "bg-indigo-600"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("processed")}
        >
          Processed
        </button>
      </div>

      {filteredSchedules.length === 0 ? (
        <p className="text-gray-400 italic">No {activeTab} schedules found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`rounded-lg shadow-md p-4 ${
                schedule.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : schedule.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <h3 className="font-bold text-lg mb-2">{schedule.amenity_name}</h3>
              <p className="text-sm">
                <span className="font-medium">Requested by:</span>{" "}
                {schedule.requested_by}
              </p>
              <p className="text-sm">
                <span className="font-medium">Date:</span>{" "}
                {schedule.request_date}
              </p>
              <p className="text-sm">
                <span className="font-medium">Time:</span>{" "}
                {schedule.time_start} - {schedule.time_end}
              </p>
              <p className="text-sm">
                <span className="font-medium">Message:</span>{" "}
                {schedule.message || "-"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Status:</span>{" "}
                {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
              </p>

              {schedule.status === "pending" && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleUpdateStatus(schedule.id, "approved")}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(schedule.id, "rejected")}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Reject
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
