import React, { useState, useEffect } from "react";

export default function ItemsView() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`http://localhost/vitecap1/capstone1/php/get_items_paginated.php?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        const availableOnly = data.items.filter((item) => parseInt(item.available) > 0);
        setItems(availableOnly);
        setTotalPages(Math.ceil(data.total / data.limit));
      });
  }, [page]);

  return (
    <div className="text-white space-y-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-10">View Items</h2>

      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-4xl min-h-[1000px] flex flex-col items-center justify-start"
        >
          <img
            src={`http://localhost/vitecap1/capstone1/uploads/${item.image}`}
            alt={item.name}
            className="w-full h-full object-cover rounded mb-4"
          />
          <h3 className="text-2xl font-bold mb-2">{item.name}</h3>
          <p className="text-base text-gray-700 mb-2">{item.description || "No description provided."}</p>
          <p className="text-sm font-medium text-indigo-600">Available: {item.available}</p>
        </div>
      ))}

      <div className="flex justify-center gap-6 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
