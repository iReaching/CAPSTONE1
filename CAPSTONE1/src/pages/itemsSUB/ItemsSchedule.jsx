import { useEffect, useState } from "react";

export default function ItemsSchedule() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = () => {
    fetch("http://localhost/vitecap1/capstone1/php/get_item_requests.php")
      .then((res) => res.json())
      .then((data) => setRequests(data));
  };

  const handleAction = (id, status) => {
    fetch("http://localhost/vitecap1/capstone1/php/update_item_request.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    }).then(() => fetchRequests());
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Item Borrow Requests</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Item</th>
            <th>Requested By</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="p-2">{req.item_name}</td>
              <td>{req.requested_by}</td>
              <td>{req.quantity}</td>
              <td>{req.status}</td>
              <td>
                <button onClick={() => handleAction(req.id, "approved")} className="text-green-600 mr-2">Approve</button>
                <button onClick={() => handleAction(req.id, "rejected")} className="text-red-600">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
