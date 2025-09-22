import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
import { 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  DollarSign,
  AlertCircle,
  FileImage,
  Loader2,
  Plus,
  Eye,
  Check,
  X,
  Users
} from "lucide-react";
export default function AdminDues() {
  const [dues, setDues] = useState([]);
  const [formData, setFormData] = useState({ user_id: "", amount_due: "", due_month: "" });
  const [homeowners, setHomeowners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [homeownersRes, duesRes] = await Promise.all([
          fetch(`${BASE_URL}get_homeowners.php`, { credentials: 'include' }),
          fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' })
        ]);
        
        const homeownersData = await homeownersRes.json();
        const duesData = await duesRes.json();
        
        setHomeowners(Array.isArray(homeownersData) ? homeownersData : []);
        setDues(Array.isArray(duesData) ? duesData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showNotification('❌ Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = new FormData();
    form.append("user_id", formData.user_id);
    form.append("amount_due", formData.amount_due);
    form.append("due_month", formData.due_month);

    try {
      const response = await fetch(`${BASE_URL}add_due.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success !== false) {
        showNotification('✅ Due added successfully!');
        setFormData({ user_id: "", amount_due: "", due_month: "" });
        setShowAddModal(false);
        
        // Refresh dues list
        const updatedResponse = await fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' });
        const updatedData = await updatedResponse.json();
        setDues(Array.isArray(updatedData) ? updatedData : []);
      } else {
        throw new Error(data.message || 'Failed to add due');
      }
    } catch (error) {
      console.error('Error adding due:', error);
      showNotification('❌ ' + (error.message || 'Failed to add due'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const approvePayment = async (id) => {
    setProcessingId(id);
    const form = new FormData();
    form.append("id", id);
    
    try {
      const response = await fetch(`${BASE_URL}approve_payment.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      showNotification('✅ ' + (data.message || 'Payment approved'));
      
      // Refresh dues list
      const updatedResponse = await fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' });
      const updatedData = await updatedResponse.json();
      setDues(Array.isArray(updatedData) ? updatedData : []);
    } catch (error) {
      console.error('Error approving payment:', error);
      showNotification('❌ Failed to approve payment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectPaymentRequest = async (id) => {
    setProcessingId(id);
    const form = new FormData();
    form.append("id", id);
    
    try {
      const response = await fetch(`${BASE_URL}reject_payment.php`, {
        method: "POST",
        body: form,
        credentials: 'include',
      });
      
      const data = await response.json();
      showNotification('✅ ' + (data.message || 'Payment request rejected'));
      
      // Refresh dues list
      const updatedResponse = await fetch(`${BASE_URL}get_dues.php`, { credentials: 'include' });
      const updatedData = await updatedResponse.json();
      setDues(Array.isArray(updatedData) ? updatedData : []);
    } catch (error) {
      console.error('Error rejecting payment:', error);
      showNotification('❌ Failed to reject payment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-gray-600">Loading dues data...</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Monthly Dues Management</h1>
            </div>
            <p className="text-gray-600">Manage homeowner monthly dues and payment approvals</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus size={20} />
            Add New Due
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dues.filter(d => Number(d.is_paid) === 0 && Number(d.payment_requested) === 1).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unpaid</p>
                <p className="text-2xl font-bold text-red-600">
                  {dues.filter(d => Number(d.is_paid) === 0 && Number(d.payment_requested) === 0).length}
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
            <p className="text-gray-600">Start by adding monthly dues for homeowners.</p>
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
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-indigo-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {homeowners.find(h => h.user_id === due.user_id)?.full_name || due.user_id}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatMonth(due.due_month)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span className="text-lg font-bold text-gray-900">
                              {formatAmount(due.amount_due)}
                            </span>
                          </div>
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
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-yellow-800">Payment Proof Submitted</p>
                            <p className="text-sm text-yellow-600">Waiting for your review</p>
                          </div>
                        </div>
                        
                        {due.payment_proof_path && (
                          <button
                            onClick={() => {
                              setModalImage(assetUrl(due.payment_proof_path));
                              setShowModal(true);
                            }}
                            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-3 transition-colors"
                          >
                            <Eye size={16} />
                            View Payment Proof
                          </button>
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => approvePayment(due.id)}
                            disabled={processingId === due.id}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {processingId === due.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check size={16} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => rejectPaymentRequest(due.id)}
                            disabled={processingId === due.id}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            {processingId === due.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X size={16} />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {Number(due.is_paid) === 0 && Number(due.payment_requested) === 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-800">Payment Pending</p>
                            <p className="text-sm text-red-600">No payment submitted yet</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => approvePayment(due.id)}
                          disabled={processingId === due.id}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {processingId === due.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Check size={16} />
                              Mark as Paid
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {Number(due.is_paid) === 1 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">Payment Confirmed</p>
                            <p className="text-sm text-green-600">Successfully processed</p>
                          </div>
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
      
      {/* View Proof Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Payment Proof</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={modalImage}
                alt="Payment Proof"
                className="w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Due Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Add New Due</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Homeowner</label>
                <select
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-black"
                  required
                >
                  <option value="">Select Homeowner</option>
                  {homeowners.map((user) => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.full_name || user.user_id}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={formData.amount_due}
                    onChange={(e) => setFormData({ ...formData, amount_due: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Month</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="e.g. January 2025"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={formData.due_month}
                    onChange={(e) => setFormData({ ...formData, due_month: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Due
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
