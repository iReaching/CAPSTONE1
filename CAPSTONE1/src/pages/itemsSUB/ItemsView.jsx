import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
export default function ItemsView() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`${BASE_URL}get_items_paginated.php?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        const availableOnly = data.items.filter((item) => parseInt(item.available) > 0);
        setItems(availableOnly);
        setTotalPages(Math.ceil(data.total / data.limit));
      });
  }, [page]);

  return (
    <div className="text-white space-y-6 p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-500">Available Items</h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-100 rounded-2xl shadow-slate-300 shadow-2xl border border-indigo-100 text-black p-4 flex flex-col"
          >
            <img
              src={`${BASE_URL}uploads/${item.image}`}
              alt={item.name}
              className="w-full h-full object-cover rounded mb-4"
            />
            <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.description || "No description provided."}</p>
            <span className="text-sm text-indigo-700 font-semibold">Available: {item.available}</span>
          </div>
        ))}


      {/* Pagination Buttons */}
      <div className="flex justify-center gap-6 mt-8">
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
