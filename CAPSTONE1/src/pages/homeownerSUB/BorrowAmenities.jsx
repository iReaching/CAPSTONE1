import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../../config";
import {
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle
} from "lucide-react";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
export default function BorrowAmenities() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amenity_id: "",
    request_date: null,
    time_start: null,
    time_end: null,
    message: ""
  });

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}get_amenities.php`, { credentials: 'include' });
        const data = await response.json();
        setAmenities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching amenities:', error);
        showNotification('❌ Failed to load amenities', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAmenities();
  }, []);

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const homeownerId = localStorage.getItem("user_id");

    const payload = new FormData();
    payload.append("homeowner_id", homeownerId);
    payload.append("amenity_id", formData.amenity_id);
    payload.append("message", formData.message || "");

    if (formData.request_date)
      payload.append("request_date", formData.request_date.toISOString().split("T")[0]);

    if (formData.time_start)
      payload.append("time_start", typeof formData.time_start === 'string' ? formData.time_start : formData.time_start.toTimeString().slice(0, 5));

    if (formData.time_end)
      payload.append("time_end", typeof formData.time_end === 'string' ? formData.time_end : formData.time_end.toTimeString().slice(0, 5));

    try {
      const response = await fetch(`${BASE_URL}schedule_amenity.php`, {
        method: "POST",
        body: payload,
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success !== false) {
        showNotification('✅ ' + (result.message || 'Amenity booking request submitted!'));
        setFormData({
          amenity_id: "",
          request_date: null,
          time_start: null,
          time_end: null,
          message: ""
        });
      } else {
        showNotification('❌ ' + (result.message || 'Failed to submit request'), 'error');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      showNotification('❌ Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading amenities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Page>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Book Amenity</h1>
              <p className="text-gray-600">Reserve community facilities for your use</p>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Reservation Details</h2>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amenity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Select Amenity
              </label>
              <select
                name="amenity_id"
                value={formData.amenity_id}
                onChange={handleChange}
                disabled={submitting}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose an amenity...</option>
                {amenities.map((amenity) => (
                  <option key={amenity.id} value={amenity.id}>
                    {amenity.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time Grid - Mobile First */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  value={formData.request_date ? formData.request_date.toISOString().slice(0,10) : ''}
                  onChange={(e) => {
                    const v = e.target.value; setFormData({ ...formData, request_date: v? new Date(v): null })
                  }}
                  min={new Date().toISOString().slice(0,10)}
                  disabled={submitting}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">Example: 2025-10-02</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={typeof formData.time_start === 'string' ? formData.time_start : (formData.time_start ? formData.time_start.toTimeString().slice(0,5) : '')}
                  onChange={(e)=> setFormData({ ...formData, time_start: e.target.value })}
                  disabled={submitting}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">Example: 09:00</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  End Time
                </label>
                <input
                  type="time"
                  value={typeof formData.time_end === 'string' ? formData.time_end : (formData.time_end ? formData.time_end.toTimeString().slice(0,5) : '')}
                  onChange={(e)=> setFormData({ ...formData, time_end: e.target.value })}
                  disabled={submitting}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <p className="mt-1 text-xs text-gray-500">Example: 11:30</p>
              </div>
            </div>

            {/* House ID removed: derived from your account details */}

            {/* Message */}
            <div>
              <label htmlFor="amenity-message" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Additional Message (Optional)
              </label>
              <textarea
                id="amenity-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={submitting}
                rows={4}
                placeholder="Add any special requests or notes..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Booking Request
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
              <h3 className="font-medium text-blue-900 mb-1">Booking Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Bookings must be made at least 48 hours in advance</li>
                <li>• Maximum booking duration is 4 hours per session</li>
                <li>• You will receive a confirmation once approved</li>
                <li>• Cancellations must be made 12 hours before the booking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}





