import { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { FileText, Clock, CheckCircle, MapPin, Calendar, Loader2, Filter } from "lucide-react";
import Page from "../components/ui/Page";
import Card, { CardContent } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { showToast } from "../lib/toast";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const showNotification = (message, type = "success") => showToast(message, type);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}get_reports.php`, { credentials: "include" });
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching reports:", error);
        showNotification("❌ Failed to load reports", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    if (!window.confirm("Mark this report as resolved?")) return;

    setProcessing(id);

    try {
      const response = await fetch(`${BASE_URL}update_report_status.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ id }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
        showNotification("✅ Report marked as resolved");
      } else {
        showNotification("❌ Failed to resolve report", "error");
      }
    } catch (error) {
      console.error("Error resolving report:", error);
      showNotification("❌ Failed to resolve report", "error");
    } finally {
      setProcessing(null);
    }
  };

  const pendingCount = reports.filter((r) => r.status === "pending" || r.status === "ongoing").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  const filteredReports =
    activeTab === "pending"
      ? reports.filter((r) => r.status === "pending" || r.status === "ongoing")
      : reports.filter((r) => r.status === "resolved");

  const Tabs = (
    <div className="flex items-center gap-2">
      <Button variant={activeTab === "pending" ? "primary" : "secondary"} onClick={() => setActiveTab("pending")}>
        Pending ({pendingCount})
      </Button>
      <Button variant={activeTab === "resolved" ? "primary" : "secondary"} onClick={() => setActiveTab("resolved")}>
        Resolved ({resolvedCount})
      </Button>
    </div>
  );

  if (loading) {
    return (
      <Page title="Maintenance Reports">
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            Loading reports...
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title="Maintenance Reports" description="Manage community issues and maintenance requests" actions={Tabs}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <Card>
          <CardContent className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} reports found</h3>
            <p className="text-gray-600">
              {activeTab === "pending" ? "All reports have been resolved!" : "No resolved reports to display."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <h3 className="text-lg font-semibold text-gray-900">Block {report.block}, Lot {report.lot}</h3>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(report.date_submitted).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={report.status === "resolved" ? "green" : "gray"}>
                    {report.status === "ongoing" ? "Ongoing" : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </div>

                <p className="mt-4 text-gray-700 leading-relaxed">{report.message}</p>

                {(report.status === "pending" || report.status === "ongoing") && (
                  <div className="mt-4">
                    <Button onClick={() => handleResolve(report.id)} disabled={processing === report.id}>
                      {processing === report.id ? (
                        <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Processing...</span>
                      ) : (
                        <span className="inline-flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Mark as Resolved</span>
                      )}
                    </Button>
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
