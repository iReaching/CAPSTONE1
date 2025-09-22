import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import Page from "../components/ui/Page";
import Card, { CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function StaffHome() {
  const [summary, setSummary] = useState({ amenity_pending: 0, item_pending: 0, report_pending: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BASE_URL}admin_dashboard_summary.php`, { credentials: 'include' })
      .then(async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return {}; }
      })
      .then((data) => setSummary(data))
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  return (
    <Page title="Staff Dashboard" description="Review and process community requests">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center text-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/512/854/854878.png" alt="Amenities" className="w-16 h-16 object-contain" />
            <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
            <p className="text-sm text-gray-600">{summary.amenity_pending} pending request(s)</p>
            <Button onClick={() => navigate("/amenities/schedules")}>Open</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/512/1946/1946488.png" alt="Items" className="w-16 h-16 object-contain" />
            <h2 className="text-lg font-semibold text-gray-900">Items</h2>
            <p className="text-sm text-gray-600">{summary.item_pending} pending request(s)</p>
            <Button onClick={() => navigate("/items/schedule")}>Open</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center gap-3">
            <img src="https://cdn-icons-png.flaticon.com/512/4371/4371424.png" alt="Reports" className="w-16 h-16 object-contain" />
            <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
            <p className="text-sm text-gray-600">{summary.report_pending} unresolved report(s)</p>
            <Button onClick={() => navigate("/reports")}>Open</Button>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
