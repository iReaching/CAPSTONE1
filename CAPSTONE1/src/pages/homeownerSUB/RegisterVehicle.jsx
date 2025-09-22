import React, { useState } from "react";
import { BASE_URL } from "../../config";
import {
  Car,
  User,
  Palette,
  Hash,
  MapPin,
  Camera,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
export default function RegisterVehicle() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: "",
    type_of_vehicle: "",
    plate_number: "",
    block: "",
    lot: "",
    image: null,
  });

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const userId = localStorage.getItem("user_id");
    const payload = new FormData();

    payload.append("user_id", userId);
    payload.append("name", formData.name);
    payload.append("color", formData.color);
    payload.append("type_of_vehicle", formData.type_of_vehicle);
    payload.append("plate_number", formData.plate_number);
    payload.append("block", formData.block);
    payload.append("lot", formData.lot);
    if (formData.image) {
      payload.append("image", formData.image);
    }

    try {
      const response = await fetch(`${BASE_URL}submit_vehicle.php`, {
        method: "POST",
        body: payload,
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success !== false) {
        showNotification('✅ ' + (data.message || 'Vehicle registered successfully!'));
        setFormData({
          name: "",
          color: "",
          type_of_vehicle: "",
          plate_number: "",
          block: "",
          lot: "",
          image: null
        });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        showNotification('❌ ' + (data.message || 'Vehicle registration failed'), 'error');
      }
    } catch (error) {
      console.error('Error registering vehicle:', error);
      showNotification('❌ Vehicle registration failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Register Vehicle</h1>
              <p className="text-gray-600">Add your vehicle for easy community access</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Vehicle Information</h2>
            </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Owner Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Owner's Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
                required
                placeholder="e.g., Juan Dela Cruz"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Vehicle Details Grid - Mobile First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Vehicle Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                  placeholder="e.g., White, Black, Red"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="w-4 h-4 inline mr-1" />
                  Vehicle Type
                </label>
                <select
                  name="type_of_vehicle"
                  value={formData.type_of_vehicle}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select vehicle type...</option>
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Van">Van</option>
                  <option value="Pickup Truck">Pickup Truck</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Plate Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-1" />
                Plate Number
              </label>
              <input
                type="text"
                name="plate_number"
                value={formData.plate_number}
                onChange={handleChange}
                disabled={submitting}
                required
                placeholder="e.g., ABC-1234 or ABC-123"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {/* Address Grid - Mobile First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Block
                </label>
                <input
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                  placeholder="e.g., A, B1, C2"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Lot/Unit
                </label>
                <input
                  type="text"
                  name="lot"
                  value={formData.lot}
                  onChange={handleChange}
                  disabled={submitting}
                  required
                  placeholder="e.g., 15, 101, L5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Vehicle Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-1" />
                Vehicle Photo
              </label>
              <div className="mt-1">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  disabled={submitting}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your vehicle (JPG, PNG, max 5MB)</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Registering Vehicle...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Register Vehicle
                  </>
                )}
              </Button>
            </div>
          </form>
          </CardContent>
        </Card>
        
        {/* Information Panel */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Registration Requirements</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Vehicle must be owned or used by a registered homeowner</li>
                <li>• Provide accurate plate number for security verification</li>
                <li>• Upload a clear, recent photo of your vehicle</li>
                <li>• Registration may take 24-48 hours for approval</li>
                <li>• Contact admin for any registration issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
