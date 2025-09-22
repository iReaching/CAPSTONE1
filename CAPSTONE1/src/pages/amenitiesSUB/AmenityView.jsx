import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
import { assetUrl } from "../../lib/asset";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";

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
    <Page
      title="Available Amenities"
      description="Browse facilities residents can reserve"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {amenities.map((amenity) => (
          <Card key={amenity.id}>
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
              <img
                src={assetUrl(amenity.image)}
                alt={amenity.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900">{amenity.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{amenity.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-8">
        <Button
          variant="secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </Page>
  );
}
