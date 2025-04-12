
import React, { useEffect, useState } from "react";

export default function AmenityView() {
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    fetch("http://localhost/vitecap1/capstone1/php/get_amenities.php")
      .then((res) => res.json())
      .then((data) => setAmenities(data))
      .catch((err) => console.error("Fetch amenities failed:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">View Amenities</h1>
      {amenities.length === 0 ? (
        <p>No amenities available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="border rounded-lg shadow-md p-4 bg-white"
            >
              <img
                src={`http://localhost/vitecap1/capstone1/${amenity.image}`}
                alt={amenity.name}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="text-lg font-semibold">{amenity.name}</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {amenity.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
