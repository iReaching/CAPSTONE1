import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
export default function StaffHome() {
  const [summary, setSummary] = useState({
    amenity_pending: 0,
    item_pending: 0,
    report_pending: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}admin_dashboard_summary.php`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Staff Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Amenities */}
        <div
          onClick={() => navigate("/staff/amenities/schedules")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
            alt="Amenities"
            className="w-20 h-20 object-contain mb-2"
          />
          <h2 className="text-lg font-semibold text-indigo-600">Amenities</h2>
          <p className="text-sm text-gray-600">{summary.amenity_pending} pending request(s)</p>
        </div>

        {/* Items */}
        <div
          onClick={() => navigate("/staff/items/schedules")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png"
            alt="Items"
            className="w-20 h-20 object-contain mb-2"
          />
          <h2 className="text-lg font-semibold text-indigo-600">Items</h2>
          <p className="text-sm text-gray-600">{summary.item_pending} pending request(s)</p>
        </div>

        {/* Reports */}
        <div
          onClick={() => navigate("/staff/reports")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/4371/4371424.png"
            alt="Reports"
            className="w-20 h-20 object-contain mb-2"
          />
          <h2 className="text-lg font-semibold text-indigo-600">Reports</h2>
          <p className="text-sm text-gray-600">{summary.report_pending} unresolved report(s)</p>
        </div>
      </div>
    </div>
  );
}