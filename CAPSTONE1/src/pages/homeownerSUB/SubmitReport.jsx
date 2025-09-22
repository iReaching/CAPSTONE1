import React, { useState } from "react";
import { BASE_URL } from "../../config";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import { FileText, Send, Loader2, MapPin, MessageSquare, AlertCircle } from "lucide-react";
export default function SubmitReport() {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    block: "",
    lot: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const userId = localStorage.getItem("user_id");

    const payload = new FormData();
    payload.append("user_id", userId);
    payload.append("message", formData.message);
    payload.append("block", formData.block);
    payload.append("lot", formData.lot);

    try {
      const res = await fetch(`${BASE_URL}submit_report.php`, {
        method: "POST",
        body: payload,
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('✅ ' + (data.message || 'Report submitted!'));
        setFormData({ message: "", block: "", lot: "" });
      } else {
        showNotification('❌ ' + (data.message || 'Failed to submit report.'), 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('❌ Failed to submit report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submit Report</h1>
              <p className="text-gray-600">Let the admin know about issues or incidents</p>
            </div>
          </div>
        </div>
        <Card className="max-w-3xl">
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Report Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="report-message" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Message
              </label>
              <Textarea id="report-message" name="message" value={formData.message} onChange={handleChange} rows={4} maxLength={1000} required disabled={submitting} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Block
                </label>
                <Input type="number" min={1} step={1} name="block" value={formData.block} onChange={handleChange} required disabled={submitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Lot
                </label>
                <Input type="number" min={1} step={1} name="lot" value={formData.lot} onChange={handleChange} required disabled={submitting} />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidance Panel */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Reporting Tips</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Provide clear details about the issue or incident</li>
                <li>• Include your block and lot for faster assistance</li>
                <li>• Avoid sharing sensitive personal information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
