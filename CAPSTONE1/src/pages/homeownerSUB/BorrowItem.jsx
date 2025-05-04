import { useState } from "react";

export default function BorrowItem() {
  const [itemId, setItemId] = useState("");
  const [borrowDate, setBorrowDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [reason, setReason] = useState("");

  const userId = localStorage.getItem("user_id");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("item_id", itemId);
    formData.append("borrow_date", borrowDate);
    formData.append("return_date", returnDate);
    formData.append("reason", reason);

    try {
      const res = await fetch("http://localhost/vitecap1/capstone1/php/borrow_item.php", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        alert("Item request submitted!");
        // Optionally reset form
        setItemId("");
        setBorrowDate("");
        setReturnDate("");
        setReason("");
      } else {
        alert(result.message || "Something went wrong.");
      }
    } catch (err) {
      alert("Submission failed.");
      console.error(err);
    }
  };

  return (
    <div className="text-white max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Borrow Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Item ID"
          value={itemId}
          onChange={(e) => setItemId(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="date"
          value={borrowDate}
          onChange={(e) => setBorrowDate(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <textarea
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <button
          type="submit"
          className="bg-indigo-600 px-4 py-2 rounded text-white hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
