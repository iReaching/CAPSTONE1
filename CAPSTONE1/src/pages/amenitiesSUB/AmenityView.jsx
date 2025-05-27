import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
export default function AmenityView() {
  const [amenities, setAmenities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`${BASE_URL}get_amenities_paginated.php?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setAmenities(data.amenities);
        setTotalPages(Math.ceil(data.total / data.limit));
      });
  }, [page]);

  return (
    <div className="text-white space-y-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Available Amenities</h2>

        {amenities.map((amenity) => (
          <div
            key={amenity.id}
            className="bg-white text-black rounded-lg shadow-lg p-4 flex flex-col"
          >
            <img
              src={`${window.location.origin}/capstone1/${amenity.image}`}
              alt={amenity.name}
              className="w-full h-full object-cover rounded mb-4"
            />
            <h3 className="text-xl font-semibold mb-1">{amenity.name}</h3>
            <p className="text-sm text-gray-600">{amenity.description}</p>
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
