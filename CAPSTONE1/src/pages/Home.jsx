import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const [summary, setSummary] = useState({
    amenity_pending: 0,
    item_pending: 0,
    report_pending: 0,
    entry_guests_today: 0,
    entry_guests_total: 0,
    total_users: 0,
    count_admin: 0,
    count_staff: 0,
    count_guard: 0,
    count_homeowner: 0,
    total_vehicles: 0,
  });  
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/admin_dashboard_summary.php")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to VilMan!</h1>
      <p className="text-2xl font-bold mb-4">Admin Dashboard</p>

      {/* Row 1: Amenities and Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amenities Preview */}
        <div
          onClick={() => navigate("/amenities/view")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/854/854878.png"
            alt="Amenities"
            className="w-24 h-24 object-contain mb-2"
          />
          <h2 className="text-lg font-semibold text-indigo-600">Amenities</h2>
          <p className="text-sm text-gray-600">{summary.amenity_pending} new schedule request(s)</p>
        </div>

        {/* Items Preview */}
        <div
          onClick={() => navigate("/items/view")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png"
            alt="Items"
            className="w-24 h-24 object-contain mb-2"
          />
          <h2 className="text-lg font-semibold text-indigo-600">Items</h2>
          <p className="text-sm text-gray-600">{summary.item_pending} new item request(s)</p>
        </div>
      </div>

      {/* Row 2: Reports and Entry Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reports Preview */}
        <div
          onClick={() => navigate("/reports")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/4371/4371424.png"
            alt="Reports"
            className="w-24 h-24 object-contain mb-2"
          />
          <h2 className="text-lg font-semibold text-indigo-600">Reports</h2>
          <p className="text-sm text-gray-600">{summary.report_pending} unresolved report(s)</p>
        </div>

        {/* Entry Log Preview */}
        <div
          onClick={() => navigate("/entrylog")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 flex flex-col items-center text-center hover:shadow-lg transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/5548/5548943.png"
            alt="Entry Logs"
            className="w-24 h-24 object-contain mb-2"
          />
          <h2 className="text-lg font-semibold text-indigo-600">Entry Logs</h2>
          <p className="text-sm text-gray-600">{summary.entry_guests_today} guest entr{summary.entry_guests_today === 1 ? "y" : "ies"} today</p>
          <p className="text-sm text-gray-500">{summary.entry_guests_total} total entr{summary.entry_guests_total === 1 ? "y" : "ies"}</p>

        </div>
      </div>

      {/* Row 3: Accounts Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Accounts Preview */}
        <div
          onClick={() => navigate("/account")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
        >
          <div className="flex space-x-4 justify-center">
            <div>
              <h2 className="text-lg font-semibold text-indigo-600">Accounts</h2>
              <p className="text-sm text-gray-700">{summary.total_users} total user(s)</p>
              <p className="text-xs text-gray-500">
                Admin: {summary.count_admin} | Staff: {summary.count_staff} | Guard: {summary.count_guard} | Homeowner: {summary.count_homeowner}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicles Preview */}
        <div
          onClick={() => navigate("/account")}
          className="cursor-pointer bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
        >
          <div className="flex flex-col items-center text-center">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3203/3203808.png"
              alt="Vehicles"
              className="w-20 h-20 object-contain mb-2"
            />
            <h2 className="text-lg font-semibold text-indigo-600">Registered Vehicles</h2>
            <p className="text-sm text-gray-600">{summary.total_vehicles} vehicle(s) registered</p>
          </div>
        </div>
      </div>




    </div>
  );
}
