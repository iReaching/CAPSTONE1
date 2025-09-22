import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { showToast } from "../../lib/toast";

export default function ItemsSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetch(`${BASE_URL}get_item_schedule.php`, { credentials: 'include' })
      .then(async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { throw new Error(`Invalid JSON (${res.status})`); }
      })
      .then((data) => setSchedules(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching item schedules:", err);
        showToast('Failed to load item schedules', 'error');
      });
  }, []);

  const handleUpdateStatus = (id, status) => {
    fetch(`${BASE_URL}update_item_status.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id, status }),
      credentials: 'include',
    })
      .then(async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { throw new Error(`Invalid JSON (${res.status})`); }
      })
      .then((data) => {
        if (data.success) {
          setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
          showToast("Status updated.");
        } else {
          showToast("Failed to update item status: " + (data.error || ''), 'error');
        }
      })
      .catch(() => showToast("Request failed.", 'error'));
  };

  const filteredSchedules =
    activeTab === "pending"
      ? schedules.filter((s) => s.status === "pending")
      : schedules.filter((s) => s.status === "approved" || s.status === "rejected");

  const Tabs = (
    <div className="flex items-center gap-2">
      <Button variant={activeTab === "pending" ? "primary" : "secondary"} onClick={() => setActiveTab("pending")}>
        Pending
      </Button>
      <Button variant={activeTab !== "pending" ? "primary" : "secondary"} onClick={() => setActiveTab("processed")}>
        Processed
      </Button>
    </div>
  );

  return (
    <Page title="Item Schedules" actions={Tabs}>
      {filteredSchedules.length === 0 ? (
        <p className="text-gray-500 italic">No {activeTab} schedules found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((s) => (
            <Card key={s.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{s.item_name}</h3>
                    <div className="mt-1 text-sm text-gray-600">
                      <div><span className="font-medium">Requested by:</span> {s.requested_by}</div>
                      <div><span className="font-medium">Date:</span> {s.request_date}</div>
                      <div><span className="font-medium">Time:</span> {s.time_start} - {s.time_end}</div>
                      <div><span className="font-medium">Message:</span> {s.message || "-"}</div>
                    </div>
                  </div>
                  <Badge variant={s.status === 'approved' ? 'green' : s.status === 'rejected' ? 'red' : 'gray'}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </Badge>
                </div>

                {s.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleUpdateStatus(s.id, "approved")}>Approve</Button>
                    <Button variant="destructive" onClick={() => handleUpdateStatus(s.id, "rejected")}>Reject</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
