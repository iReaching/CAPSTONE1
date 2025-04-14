import { useEffect, useState } from "react";

export default function ItemsEdit() {
  const [items, setItems] = useState([]);

  const fetchItems = () => {
    fetch("http://localhost/vitecap1/capstone1/php/get_items.php")
      .then((res) => res.json())
      .then((data) => setItems(data));
  };

  const handleDelete = (id) => {
    fetch("http://localhost/vitecap1/capstone1/php/delete_item.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
      .then((res) => res.json())
      .then(() => fetchItems());
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Edit/Delete Items</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border p-3 rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
