import { useState } from "react";

export default function RegisterVehicle() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [color, setColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [block, setBlock] = useState("");
  const [lot, setLot] = useState("");
  const [image, setImage] = useState(null);

  const userId = localStorage.getItem("user_id");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("name", name);
    formData.append("type_of_vehicle", type);
    formData.append("color", color);
    formData.append("plate_number", plateNumber);
    formData.append("block", block);
    formData.append("lot", lot);
    formData.append("vehicle_pic", image);

    try {
      const res = await fetch("http://localhost/vitecap1/capstone1/php/submit_vehicle.php", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        alert("Vehicle registered successfully!");
        setName("");
        setType("");
        setColor("");
        setPlateNumber("");
        setBlock("");
        setLot("");
        setImage(null);
      } else {
        alert(result.message || "Registration failed.");
      }
    } catch (err) {
      alert("Submission error.");
      console.error(err);
    }
  };

  return (
    <div className="text-white max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Register Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <input
          type="text"
          placeholder="Vehicle Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="text"
          placeholder="Type (e.g., Car, Motorcycle)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="text"
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="text"
          placeholder="Plate Number"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="text"
          placeholder="Block"
          value={block}
          onChange={(e) => setBlock(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="text"
          placeholder="Lot"
          value={lot}
          onChange={(e) => setLot(e.target.value)}
          required
          className="w-full px-3 py-2 text-black rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
          className="text-white"
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
