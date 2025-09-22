import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Table, { THead, TR, TH, TBody, TD } from "../../components/ui/Table";
import Card, { CardContent } from "../../components/ui/Card";
import { UserCheck } from "lucide-react";
export default function VisitorLogHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetch(`${BASE_URL}get_my_entrylogs.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, [userId]);

  return (
    <Page>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Visitor Log History</h1>
              <p className="text-gray-600">Review past entry logs associated with your account</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-500 italic">No visitor logs found.</div>
        ) : (
          <Card>
            <CardContent>
              <Table>
                <THead>
                  <TR>
                    <TH>Visitor Name</TH>
                    <TH>Reason</TH>
                    <TH>Vehicle Plate</TH>
                    <TH>Expected</TH>
                    <TH>Expected Time</TH>
                    <TH>Timestamp</TH>
                  </TR>
                </THead>
                <TBody>
                  {logs.map((log) => (
                    <TR key={log.id}>
                      <TD>{log.name}</TD>
                      <TD>{log.reason}</TD>
                      <TD>{log.vehicle_plate || "—"}</TD>
                      <TD>{log.expected === 1 ? "Yes" : "No"}</TD>
                      <TD>{log.expected_time || "—"}</TD>
                      <TD>{log.timestamp}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Page>
  );
}
