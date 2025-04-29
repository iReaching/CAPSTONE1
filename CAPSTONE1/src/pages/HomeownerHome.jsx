import React, { useEffect, useState } from "react";

export default function HomeownerHome() {
  const [summary, setSummary] = useState({
    my_amenities: 0,
    my_items: 0,
    my_reports: 0,
    my_guests: 0
  });

  useEffect(() => {
    const user_id = localStorage.getItem("user_id");
    if (!user_id) return;
    fetch(`http://localhost/vitecap1/capstone1/php/homeowner_dashboard_summary.php?user_id=${user_id}`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Homeowner summary error:", err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, Homeowner!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-indigo-600">My Amenity Requests</h2>
          <p className="text-3xl font-bold mt-2">{summary.my_amenities}</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-indigo-600">My Item Borrowings</h2>
          <p className="text-3xl font-bold mt-2">{summary.my_items}</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-indigo-600">My Reports</h2>
          <p className="text-3xl font-bold mt-2">{summary.my_reports}</p>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <h2 className="text-lg font-semibold text-indigo-600">Guest Requests</h2>
          <p className="text-3xl font-bold mt-2">{summary.my_guests}</p>
        </div>
      </div>
    </div>
  );
}
