import React, { useEffect, useState } from "react";

export default function GuardHome() {
  const [summary, setSummary] = useState({
    entries_today: 0,
    expected_guests: 0
  });

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/guard_dashboard_summary.php")
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error("Guard summary error:", err));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Guard Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6 text-center text-black">
          <h2 className="text-lg font-semibold text-indigo-600">Today's Guest Entries</h2>
          <p className="text-3xl font-bold mt-2">{summary.entries_today}</p>
        </div>

        <div className="bg-white rounded shadow p-6 text-center text-black">
          <h2 className="text-lg font-semibold text-indigo-600">Expected Guests</h2>
          <p className="text-3xl font-bold mt-2">{summary.expected_guests}</p>
        </div>
      </div>
    </div>
  );
}
