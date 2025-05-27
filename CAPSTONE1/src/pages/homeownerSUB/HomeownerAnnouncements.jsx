import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
export default function HomeownerAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}get_announcements.php`)
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-6 text-indigo-500">Announcements</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : announcements.length === 0 ? (
        <p className="text-gray-400">No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white text-black p-4 rounded shadow">
              <h4 className="text-lg font-semibold">{a.title}</h4>
              <p className="text-sm text-gray-700 mt-1">{a.body}</p>
              <p className="text-xs text-gray-500 mt-1">Posted: {a.date_posted}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
