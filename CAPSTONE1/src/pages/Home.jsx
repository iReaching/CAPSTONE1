import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import {
  LayoutDashboard,
  Building2,
  Package,
  FileText,
  Shield,
  Users,
  Car,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}admin_dashboard_summary.php`, { credentials: 'include' });
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Welcome to CondoLink!</h1>
              <p className="text-xl text-indigo-600 font-semibold">Admin Dashboard</p>
            </div>
          </div>
          <p className="text-gray-600 ml-15">Monitor and manage your condominium community</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-orange-600">
                  {summary.amenity_pending + summary.item_pending + summary.report_pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Guests</p>
                <p className="text-2xl font-bold text-blue-600">{summary.entry_guests_today}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-green-600">{summary.total_users}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vehicles</p>
                <p className="text-2xl font-bold text-purple-600">{summary.total_vehicles}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Amenities Card */}
          <div
            onClick={() => navigate("/amenities/view")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
                <p className="text-sm text-gray-600">Manage facilities</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {summary.amenity_pending > 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      {summary.amenity_pending} pending request{summary.amenity_pending !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">All requests handled</span>
                  </>
                )}
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>

          {/* Items Card */}
          <div
            onClick={() => navigate("/items/view")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Items</h3>
                <p className="text-sm text-gray-600">Borrowable items</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {summary.item_pending > 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      {summary.item_pending} pending request{summary.item_pending !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">All requests handled</span>
                  </>
                )}
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </div>

          {/* Reports Card */}
          <div
            onClick={() => navigate("/reports")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <p className="text-sm text-gray-600">Community issues</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {summary.report_pending > 0 ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      {summary.report_pending} unresolved issue{summary.report_pending !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">All issues resolved</span>
                  </>
                )}
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
            </div>
          </div>

          {/* Entry Logs Card */}
          <div
            onClick={() => navigate("/entrylog")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Entry Logs</h3>
                <p className="text-sm text-gray-600">Security monitoring</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Today's entries</span>
                <span className="text-sm font-semibold text-indigo-600">{summary.entry_guests_today}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total entries</span>
                <span className="text-sm font-semibold text-gray-900">{summary.entry_guests_total}</span>
              </div>
            </div>
          </div>

          {/* Accounts Card */}
          <div
            onClick={() => navigate("/account")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Accounts</h3>
                <p className="text-sm text-gray-600">Manage users</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total users</span>
                <span className="text-sm font-semibold text-purple-600">{summary.total_users}</span>
              </div>
              <div className="text-xs text-gray-500">
                Admin: {summary.count_admin} • Staff: {summary.count_staff} • Guard: {summary.count_guard} • Homeowner: {summary.count_homeowner}
              </div>
            </div>
          </div>

          {/* Monthly Dues Card */}
          <div
            onClick={() => navigate("/admin-dues")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Dues</h3>
                <p className="text-sm text-gray-600">Payment management</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Manage payments</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
