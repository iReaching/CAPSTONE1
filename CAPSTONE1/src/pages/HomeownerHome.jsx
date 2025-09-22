import React from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import {
  Home,
  Building2,
  Package,
  FileText,
  Car,
  Shield,
  UserCheck,
  Calendar,
  CreditCard,
  Bell,
  TrendingUp
} from "lucide-react";
export default function HomeownerHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Welcome Home!</h1>
              <p className="text-xl text-indigo-600 font-semibold">Homeowner Dashboard</p>
            </div>
          </div>
          <p className="text-gray-600 ml-15">Access all your community services and manage your home</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* View Amenities */}
          <div
            onClick={() => navigate("/amenities/view")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Amenities</h3>
                <p className="text-sm text-gray-600">Browse facilities</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Check availability</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>

          {/* View Items */}
          <div
            onClick={() => navigate("/items/view")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">View Items</h3>
                <p className="text-sm text-gray-600">Browse borrowables</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">See what's available</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </div>

          {/* Borrow Amenity */}
          <div
            onClick={() => navigate("/homeowner/borrow_amenities")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Book Amenity</h3>
                <p className="text-sm text-gray-600">Reserve facilities</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Make a reservation</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </div>

          {/* Borrow Item */}
          <div
            onClick={() => navigate("/homeowner/borrow_item")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Borrow Item</h3>
                <p className="text-sm text-gray-600">Request items</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Submit request</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
          </div>

          {/* Submit Report */}
          <div
            onClick={() => navigate("/homeowner/submit_report")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submit Report</h3>
                <p className="text-sm text-gray-600">Report issues</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Let us know</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
            </div>
          </div>

          {/* Register Vehicle */}
          <div
            onClick={() => navigate("/homeowner/register_vehicle")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Car className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Register Vehicle</h3>
                <p className="text-sm text-gray-600">Add your car</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Easy entry access</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
            </div>
          </div>

          {/* Entry Log Request */}
          <div
            onClick={() => navigate("/homeowner/request_entry")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Guest Entry Request</h3>
                <p className="text-sm text-gray-600">Notify security</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Expect visitors</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" />
            </div>
          </div>

          {/* Visitor Logs */}
          <div
            onClick={() => navigate("/homeowner/visitor_logs")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                <UserCheck className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Visitor History</h3>
                <p className="text-sm text-gray-600">View past visits</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Track entries</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
            </div>
          </div>

          {/* Monthly Dues */}
          <div
            onClick={() => navigate("/homeowner/dues")}
            className="group cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Dues</h3>
                <p className="text-sm text-gray-600">Pay your bills</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Manage payments</span>
              <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Quick Info Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Welcome to Your Community Portal</h2>
          </div>
          <p className="text-gray-600">
            This is your central hub for all community services. You can book amenities, borrow items, 
            register vehicles, submit reports, and manage your monthly dues all from here. 
            If you need any assistance, don't hesitate to contact the admin.
          </p>
        </div>
      </div>
    </div>
  );
}
