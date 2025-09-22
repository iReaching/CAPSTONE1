import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import { Megaphone } from "lucide-react";
export default function HomeownerAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}get_announcements.php`, { credentials: 'include' })
      .then(async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
      })
      .then((data) => {
        const arr = Array.isArray(data) ? data : (data.announcements || []);
        setAnnouncements(arr);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch announcements", err);
        setLoading(false);
      });
  }, []);


  return (
    <Page>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Announcements</h1>
              <p className="text-gray-600">Latest updates for residents</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-gray-500">No announcements yet.</div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card key={a.id}>
                <CardContent>
                  <h4 className="text-lg font-semibold text-gray-900">{a.subject || a.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{a.content}</p>
                  <p className="text-xs text-gray-500 mt-1">Posted: {a.date_posted}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}
