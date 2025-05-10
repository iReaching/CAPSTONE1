import React from "react";
import { useNavigate } from "react-router-dom";

export default function HomeownerHome() {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Homeowner Dashboard</h1>

      {/* Row 1: View Amenities and Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate("/amenities/view")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">View Amenities</h2>
          <p className="text-gray-600 text-sm">Check available amenities</p>
        </div>
        <div
          onClick={() => navigate("/items/view")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">View Items</h2>
          <p className="text-gray-600 text-sm">Browse available items</p>
        </div>
      </div>

      {/* Row 2: Borrow Amenity and Item */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate("/homeowner/borrow_amenities")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Borrow Amenity</h2>
          <p className="text-gray-600 text-sm">Request to use an amenity</p>
        </div>
        <div
          onClick={() => navigate("/homeowner/borrow_item")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Borrow Item</h2>
          <p className="text-gray-600 text-sm">Submit a borrow request for items</p>
        </div>
      </div>

      {/* Row 3: Submit Report and Register Vehicle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate("/homeowner/submit_report")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Submit Report</h2>
          <p className="text-gray-600 text-sm">Report an issue or concern</p>
        </div>
        <div
          onClick={() => navigate("/homeowner/register_vehicle")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Register Vehicle</h2>
          <p className="text-gray-600 text-sm">Add vehicle details for entry recognition</p>
        </div>
      </div>

      {/* Row 4: Visitor Log History and Entry Log Request */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => navigate("/homeowner/request_entry")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Submit Entry Log Request</h2>
          <p className="text-gray-600 text-sm">Let guards know about expected guests</p>
        </div>
        <div
          onClick={() => navigate("/homeowner/visitor_logs")}
          className="cursor-pointer bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition"
        >
          <h2 className="text-lg font-semibold text-indigo-600">Visitor Logs</h2>
          <p className="text-gray-600 text-sm">View your past visitor entry log history</p>
        </div>
      </div>
    </div>
  );
}
