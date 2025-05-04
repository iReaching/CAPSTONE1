import { useState } from "react";

export default function BorrowAmenities() {
  const [amenityId, setAmenityId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");

  const userId = localStorage.getItem("user_id");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("homeowner_id", userId);
    formData.append("amenity_id", amenityId);
    formData.append("start_time", startTime);
    formData.append("end_time", endTime);
    formData.append("purpose", purpose);

    try {
      const res = await fetch("http://localhost/vitecap1/capstone1/php/schedule_amenity.php", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        alert("Amenity schedule submitted!");
        setAmenityId("");
        setStartTime("");
        setEndTime("");
        setPurpose("");
      } else {
        alert(result.message || "Failed to schedule.");
      }
    } catch (err) {
      alert("Submission failed.");
      console.error(err);
    }
  };

  return (
    <div className="text-white max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Borrow Amenity</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Amenity ID"
          value={amenityId}
          onChange={(e) => setAmenityId(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <textarea
          placeholder="Purpose"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
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
