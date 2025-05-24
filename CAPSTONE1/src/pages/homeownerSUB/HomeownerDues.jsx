import React, { useEffect, useState } from "react";

export default function HomeownerDues() {
  const userId = localStorage.getItem("user_id");
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_dues.php?user_id=" + userId)
      .then((res) => res.json())
      .then((data) => {
        setDues(data);
        setLoading(false);
      });
  }, []);

  const handleProofUpload = (file, dueId) => {
    if (!file) return;
    const form = new FormData();
    form.append("id", dueId);
    form.append("user_id", userId);
    form.append("payment_proof", file);

    fetch("http://localhost/vitecap1/capstone1/php/request_payment.php", {
      method: "POST",
      body: form,
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        return fetch("http://localhost/vitecap1/capstone1/php/get_dues.php?user_id=" + userId);
      })
      .then((res) => res.json())
      .then((data) => setDues(data));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">My Monthly Dues</h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : dues.length === 0 ? (
        <p className="text-gray-400">No dues found.</p>
      ) : (
        <div className="space-y-4">
          {dues.map((d) => (
            <div key={d.id} className="bg-white text-black p-4 rounded shadow">
              <p><strong>Month:</strong> {d.due_month}</p>
              <p><strong>Amount:</strong> ₱{d.amount_due}</p>
              <p><strong>Status:</strong> {Number(d.is_paid) === 1 ? "Paid" : "Unpaid"}</p>
              {Number(d.is_paid) === 1 && d.payment_date && (
                <p><strong>Paid on:</strong> {d.payment_date}</p>
              )}
              {Number(d.is_paid) === 0 && Number(d.payment_requested) === 1 && (
                <p className="text-yellow-600 mt-2">Waiting for admin approval...</p>
              )}
              {Number(d.is_paid) === 0 && Number(d.payment_requested) === 0 && (
                <div className="mt-2 space-y-2">
                    <div className="mt-2">
                    <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
                        Upload Payment Proof (I Already Paid)
                        <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleProofUpload(e.target.files[0], d.id)}
                        className="hidden"
                        />
                    </label>
                    </div>

                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
