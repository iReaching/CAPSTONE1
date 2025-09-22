import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { Shield, Clock, Send, Loader2, Users, Package, Car, CheckCircle } from "lucide-react";
export default function EntryLogRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vehicle_plate: "",
    reason: "",
    expected_time: null,
    visitor_count: 1,
    package_details: "",
    homeowner_name: "", 
  });

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    // Fetch full name of the logged-in user to set as homeowner_name
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          setFormData((prev) => ({
            ...prev,
            homeowner_name: data.full_name || ""
          }));
        })
        .catch((err) => console.error("Failed to fetch profile:", err));
    }
  }, [userId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("vehicle_plate", formData.vehicle_plate);
    payload.append("reason", formData.reason);
    payload.append("visitor_count", formData.visitor_count);
    payload.append("package_details", formData.package_details);
    payload.append("homeowner_name", formData.homeowner_name);
    payload.append("requested_by", userId);

    if (formData.expected_time) {
      payload.append("expected_time", formData.expected_time.toTimeString().slice(0, 5));
    }

    fetch(`${BASE_URL}request_entrylog.php`, {
      method: "POST",
      body: payload,
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        showNotification('✅ ' + (data.message || "Request sent!"));
        setFormData({
          name: "",
          vehicle_plate: "",
          reason: "",
          expected_time: null,
          visitor_count: 1,
          package_details: "",
          homeowner_name: formData.homeowner_name, 
        });
      })
      .catch((err) => {
        console.error(err);
        showNotification('❌ Failed to submit entry log request.', 'error');
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Page>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Request Entry Log</h1>
              <p className="text-gray-600">Notify security about expected guests</p>
            </div>
          </div>
        </div>
        <Card className="max-w-3xl">
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Guest Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Plate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Visitor Name
                </label>
                <Input name="name" value={formData.name} onChange={handleChange} required disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vehicle Plate (optional)
                </label>
                <Input name="vehicle_plate" value={formData.vehicle_plate} onChange={handleChange} disabled={submitting} />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Reason
              </label>
              <Input name="reason" value={formData.reason} onChange={handleChange} required maxLength={200} disabled={submitting} />
            </div>

            {/* Visitors + Package */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Visitors
                </label>
                <Input type="number" name="visitor_count" value={formData.visitor_count} onChange={handleChange} min={1} required disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Package Details
                </label>
                <Input name="package_details" value={formData.package_details} onChange={handleChange} maxLength={500} disabled={submitting} />
              </div>
            </div>

            {/* Expected time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Expected Arrival Time (optional)
              </label>
              <DatePicker
                selected={formData.expected_time}
                onChange={(time) => setFormData({ ...formData, expected_time: time })}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholderText="Select time"
                disabled={submitting}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Information */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Entry Request Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Provide accurate visitor details for faster gate processing</li>
                <li>• Optional: add package details if expecting deliveries</li>
                <li>• Specify expected time to help security prepare</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
