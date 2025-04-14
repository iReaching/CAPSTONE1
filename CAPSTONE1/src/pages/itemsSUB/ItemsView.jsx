// src/pages/itemsSUB/ItemsView.jsx
import { useEffect, useState } from "react";

export default function ItemsView() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Replace this with actual API call later
    fetch("http://localhost/vitecap1/capstone1/php/get_items.php")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error("Failed to fetch items:", err));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Available Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <img
                src={
                  item.image_path?.startsWith("uploads/")
                    ? `http://localhost/vitecap1/capstone1/${item.image_path}`
                    : "https://via.placeholder.com/150"
                }
                alt={item.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-bold">{item.name}</h3>
              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No items available.</p>
        )}
      </div>
    </div>
  );
}
