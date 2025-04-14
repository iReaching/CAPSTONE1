import React, { useState, useEffect } from "react";

export default function AmenityView() {
  const [amenities, setAmenities] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`http://localhost/vitecap1/capstone1/php/get_amenities_paginated.php?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setAmenities(data.amenities);
        setTotalPages(Math.ceil(data.total / data.limit));
      });
  }, [page]);

  return (
    <div className="text-white space-y-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-10">View Amenities</h2>

      {amenities.map((amenity) => (
        <div
          key={amenity.id}
          className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-4xl min-h-[700px] flex flex-col items-center justify-start"
        >
          <img
            src={`http://localhost/vitecap1/capstone1/${amenity.image}`}
            alt={amenity.name}
            className="w-full h-[500px] object-cover rounded mb-4"
          />
          <h3 className="text-2xl font-bold mb-2">{amenity.name}</h3>
          <p className="text-base text-gray-700">{amenity.description}</p>
        </div>
      ))}

      {/* Pagination Buttons */}
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
