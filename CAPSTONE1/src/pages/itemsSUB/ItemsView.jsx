import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../config";
import { assetUrl } from "../../lib/asset";
import Page from "../../components/ui/Page";
import Card, { CardContent } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { showToast } from "../../lib/toast";

export default function ItemsView() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`${BASE_URL}get_items_paginated.php?page=${page}`, { credentials: 'include' })
      .then(async (res) => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { throw new Error(`Invalid JSON (${res.status})`); }
      })
      .then((data) => {
        const list = Array.isArray(data.items) ? data.items : [];
        const availableOnly = list.filter((item) => parseInt(item.available) > 0);
        setItems(availableOnly);
        setTotalPages(Math.max(1, Math.ceil((Number(data.total)||0) / (Number(data.limit)||1))));
      })
      .catch((err) => {
        console.error(err);
        showToast('Failed to load items', 'error');
      });
  }, [page]);

  return (
    <Page title="Available Items" description="Borrowable inventory available to residents">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id}>
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
              <img src={assetUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <CardContent className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.description || "No description provided."}</p>
              <span className="inline-block mt-2 text-sm text-indigo-700 font-semibold">Available: {item.available}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center gap-3 mt-8">
        <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
        <Button variant="primary" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
      </div>
    </Page>
  );
}
