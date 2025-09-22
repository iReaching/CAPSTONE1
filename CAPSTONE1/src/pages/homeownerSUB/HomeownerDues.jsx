import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import { 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Upload, 
  DollarSign,
  AlertCircle,
  FileImage,
  Loader2
} from "lucide-react";

export default function HomeownerDues() {
  const userId = localStorage.getItem("user_id");
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}get_dues.php?user_id=${userId}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setDues(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dues:', err);
        setLoading(false);
      });
  }, [userId]);

  const handleProofUpload = async (file, dueId) => {
    if (!file) return;
    
    setUploadingId(dueId);
    const form = new FormData();
    form.append("id", dueId);
    form.append("user_id", userId);
    form.append("payment_proof", file);

    try {
      const response = await fetch(`${BASE_URL}request_payment.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all';
        notification.innerHTML = '✅ Payment proof uploaded successfully!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        // Refresh dues
        const updatedResponse = await fetch(`${BASE_URL}get_dues.php?user_id=${userId}`, { credentials: 'include' });
        const updatedData = await updatedResponse.json();
        setDues(Array.isArray(updatedData) ? updatedData : []);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all';
      notification.innerHTML = '❌ ' + (error.message || 'Upload failed');
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusBadge = (due) => {
    if (Number(due.is_paid) === 1) {
      return (
        <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle size={16} />
          Paid
        </div>
      );
    } else if (Number(due.payment_requested) === 1) {
      return (
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          <Clock size={16} />
          Under Review
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          <AlertCircle size={16} />
          Unpaid
        </div>
      );
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatMonth = (monthStr) => {
    try {
      const date = new Date(monthStr + '-01');
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return monthStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading your dues...</p>
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
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Monthly Dues</h1>
          </div>
          <p className="text-gray-600">Track your monthly association dues and payment status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dues</p>
                <p className="text-2xl font-bold text-gray-900">{dues.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {dues.filter(d => Number(d.is_paid) === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-red-600">
                  {dues.filter(d => Number(d.is_paid) === 0).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dues List */}
        {dues.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No dues found</h3>
            <p className="text-gray-600">You don't have any monthly dues at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {dues.map((due) => (
              <div key={due.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left side - Due info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {formatMonth(due.due_month)}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign size={16} />
                          <span className="text-2xl font-bold text-gray-900">
                            {formatAmount(due.amount_due)}
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(due)}
                    </div>
                    
                    {Number(due.is_paid) === 1 && due.payment_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={14} className="text-green-500" />
                        Paid on {new Date(due.payment_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Right side - Actions */}
                  <div className="flex-shrink-0">
                    {Number(due.is_paid) === 0 && Number(due.payment_requested) === 1 && (
                      <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Under Review</p>
                          <p className="text-xs text-yellow-600">Waiting for admin approval</p>
                        </div>
                      </div>
                    )}
                    
                    {Number(due.is_paid) === 0 && Number(due.payment_requested) === 0 && (
                      <div className="space-y-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-2">Upload payment proof</p>
                          <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl cursor-pointer transition-colors font-medium">
                            {uploadingId === due.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Choose File
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => handleProofUpload(e.target.files[0], due.id)}
                              className="hidden"
                              disabled={uploadingId === due.id}
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FileImage size={12} />
                          Accepts: Images, PDF (Max 5MB)
                        </div>
                      </div>
                    )}
                    
                    {Number(due.is_paid) === 1 && (
                      <div className="flex items-center gap-3 bg-green-50 p-4 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Payment Confirmed</p>
                          <p className="text-xs text-green-600">Thank you for your payment!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
