import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
export default function AdminDues() {
  const [dues, setDues] = useState([]);
  const [formData, setFormData] = useState({ user_id: "", amount_due: "", due_month: "" });
  const [homeowners, setHomeowners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}get_homeowners.php`)
      .then((res) => res.json())
      .then((data) => setHomeowners(data));

    fetch(`${BASE_URL}get_dues.php`)
      .then((res) => res.json())
      .then((data) => setDues(data));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("user_id", formData.user_id);
    form.append("amount_due", formData.amount_due);
    form.append("due_month", formData.due_month);

    fetch(`${BASE_URL}add_due.php`, {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then(() => {
        setFormData({ user_id: "", amount_due: "", due_month: "" });
        setShowAddModal(false);
        return fetch(`${BASE_URL}get_dues.php`);
      })
      .then((res) => res.json())
      .then((data) => setDues(data));
  };

  const approvePayment = (id) => {
    const form = new FormData();
    form.append("id", id);

    fetch(`${BASE_URL}approve_payment.php`, {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        return fetch(`${BASE_URL}get_dues.php`);
      })
      .then((res) => res.json())
      .then((data) => setDues(data));
  };

  const rejectPaymentRequest = (id) => {
    const form = new FormData();
    form.append("id", id);

    fetch(`${BASE_URL}reject_payment.php`, {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        return fetch(`${BASE_URL}get_dues.php`);
      })
      .then((res) => res.json())
      .then((data) => setDues(data));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Monthly Association Dues</h2>

      <button
        onClick={() => setShowAddModal(true)}
        className="mb-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
      >
        + Add Due
      </button>

      <table className="w-full bg-white text-black rounded overflow-hidden shadow">
        <thead className="bg-gray-200 text-center">
          <tr>
            <th className="p-3">User</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Month</th>
            <th className="p-3">Status</th>
            <th className="p-3">Paid On</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dues.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="p-3">{d.user_id}</td>
              <td className="p-3">₱{d.amount_due}</td>
              <td className="p-3">{d.due_month}</td>
              <td className="p-3">{Number(d.is_paid) === 1 ? "Paid" : "Unpaid"}</td>
              <td className="p-3">{d.payment_date || "-"}</td>
              <td className="p-3 space-y-1">
                {Number(d.is_paid) === 0 && (
                <>
                    {Number(d.payment_requested) === 1 && (
                    <>
                        <div className="text-yellow-600 text-sm mb-1 text-center">
                        Request: Homeowner submitted payment proof
                        </div>
                        {d.payment_proof_path && (
                        <div className="mb-1 text-center">
                            <button
                            onClick={() => {
                                setModalImage(`${window.location.origin}/${d.payment_proof_path}`);
                                setShowModal(true);
                            }}
                            className="text-blue-600 underline"
                            >
                            View Proof
                            </button>
                        </div>
                        )}
                        <div className="flex justify-center gap-2">
                        <button
                            onClick={() => approvePayment(d.id)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => rejectPaymentRequest(d.id)}
                            className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                        >
                            Reject
                        </button>
                        </div>
                    </>
                    )}

                    {Number(d.payment_requested) === 0 && (
                    <div className="flex justify-center">
                        <button
                        onClick={() => approvePayment(d.id)}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm"
                        >
                        Set to Paid
                        </button>
                    </div>
                    )}
                </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Proof Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded shadow-lg max-w-lg w-full p-4 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-black hover:text-red-600"
            >
              ✖
            </button>
            <img
              src={modalImage}
              alt="Payment Proof"
              className="w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* Add Due Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white text-black rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
            >
              ✖
            </button>
            <h3 className="text-xl font-bold mb-4">Add Due</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Homeowner</option>
                {homeowners.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.full_name || user.user_id}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Amount Due"
                className="w-full p-2 border rounded"
                value={formData.amount_due}
                onChange={(e) => setFormData({ ...formData, amount_due: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Due Month (e.g. June 2025)"
                className="w-full p-2 border rounded"
                value={formData.due_month}
                onChange={(e) => setFormData({ ...formData, due_month: e.target.value })}
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded w-full"
              >
                Add Due
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
