import { useState } from "react";

export default function ItemsAdd() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("quantity", quantity);
    formData.append("image", image);

    fetch("http://localhost/vitecap1/capstone1/php/add_item.php", {
      method: "POST",
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setName("");
        setQuantity(1);
        setImage(null);
      })
      .catch((err) => console.error("Add item error:", err));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md">
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Item Name" className="w-full border px-3 py-2 rounded" required />
      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" className="w-full border px-3 py-2 rounded" min="1" required />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} className="w-full" />
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add Item</button>
    </form>
  );
}
