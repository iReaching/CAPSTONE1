import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { parseMarketplaceDescription } from "../lib/marketplace";
import { assetUrl } from "../lib/asset";
import { Megaphone, Check, X, Loader2, User, MapPin, Phone, ShoppingBag, Info, Trash2 } from "lucide-react";

export default function MarketModeration() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [deletingImageId, setDeletingImageId] = useState(null);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}get_market_posts.php?status=pending`, { credentials: "include" });
      const data = await res.json();
      const items = Array.isArray(data)
        ? data.map((item) => ({
            ...item,
            marketplace: parseMarketplaceDescription(item.description)
          }))
        : [];
      setPending(items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const act = async (id, action) => {
    setActingId(id);
    try {
      const fd = new FormData();
      fd.append("id", id);
      fd.append("action", action);
      const res = await fetch(`${BASE_URL}update_market_post_status.php`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        fetchPending();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActingId(null);
    }
  };

  const removeImageFromPost = (postId, imageId) => {
    setPending((prev) =>
      prev.map((item) =>
        item.id === postId
          ? {
              ...item,
              images: (item.images || []).filter((img) => (typeof img === "object" ? img.id : null) !== imageId)
            }
          : item
      )
    );
  };

  const handleDeleteImage = async (postId, imageId) => {
    if (!imageId) {
      window.alert("Only gallery images can be deleted from here.");
      return;
    }
    if (!window.confirm("Delete this image from the listing?")) return;
    setDeletingImageId(imageId);
    try {
      const fd = new FormData();
      fd.append("id", imageId);
      const response = await fetch(`${BASE_URL}delete_market_post_image.php`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) {
        removeImageFromPost(postId, imageId);
        setLightbox(null);
      } else {
        window.alert(data.message || "Failed to delete image");
      }
    } catch (error) {
      console.error(error);
      window.alert("Failed to delete image");
    } finally {
      setDeletingImageId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Megaphone className="w-5 h-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Marketplace Moderation</h3>
        <span className="ml-auto text-xs text-gray-500">Approve or reject tenant posts</span>
      </div>
      {loading ? (
        <div className="p-6 text-gray-600">Loading pending posts...</div>
      ) : pending.length === 0 ? (
        <div className="p-6 text-gray-600">No pending posts.</div>
      ) : (
        <ul className="divide-y">
          {pending.map((post) => {
            const meta = post.marketplace;
            const gallery = Array.isArray(post.images) ? post.images : [];
            const coverPath = post.image_path ? assetUrl(post.image_path) : null;

            return (
              <li key={post.id} className="p-4 flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                <div className="flex items-start gap-3 md:w-2/3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">{post.poster_name || post.user_id}</span>
                      <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          post.category === "for_sale" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {post.category === "for_sale" ? "For Sale" : "For Rent"}
                      </span>
                      {post.price !== null && post.price !== undefined && (
                        <span className="text-xs font-semibold text-indigo-700">
                          PHP {Number(post.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-semibold text-gray-900">{post.title}</div>

                    {(meta.overview || meta.raw) && (
                      <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {meta.overview || meta.raw}
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {meta.purchaseInstructions && (
                        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                          <div className="flex items-center gap-1 text-sm font-semibold text-indigo-700">
                            <ShoppingBag className="w-4 h-4" /> How to buy
                          </div>
                          <p className="mt-1 text-xs text-indigo-900 whitespace-pre-wrap">{meta.purchaseInstructions}</p>
                        </div>
                      )}
                      {meta.purchaseLocation && (
                        <div className="rounded-xl border border-gray-200 p-3">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <MapPin className="w-4 h-4 text-indigo-600" /> Where to buy / meet
                          </div>
                          <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">{meta.purchaseLocation}</p>
                        </div>
                      )}
                      {meta.pickupWindow && (
                        <div className="rounded-xl border border-gray-200 p-3">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <Info className="w-4 h-4 text-indigo-600" /> Preferred schedule
                          </div>
                          <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">{meta.pickupWindow}</p>
                        </div>
                      )}
                      {meta.contactInfo && (
                        <div className="rounded-xl border border-gray-200 p-3">
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <Phone className="w-4 h-4 text-indigo-600" /> Contact details
                          </div>
                          <p className="mt-1 text-xs text-gray-700 whitespace-pre-wrap">{meta.contactInfo}</p>
                        </div>
                      )}
                    </div>

                    {coverPath && (
                      <div className="mt-3">
                        <img
                          src={coverPath}
                          alt="Listing preview"
                          className="w-full max-h-40 object-cover rounded-xl border cursor-pointer"
                          onClick={() => setLightbox({ url: coverPath, postId: post.id, imageId: null, title: post.title })}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {gallery.length > 0 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {gallery.map((img, idx) => {
                          const path = typeof img === "string" ? img : img.path || "";
                          const resolved = assetUrl(path);
                          const imageId = typeof img === "object" ? img.id : null;
                          return (
                            <button
                              key={imageId ?? idx}
                              type="button"
                              onClick={() => setLightbox({ url: resolved, postId: post.id, imageId, title: post.title })}
                              className="relative flex-shrink-0"
                            >
                              <img
                                src={resolved}
                                alt={`Listing ${idx + 1}`}
                                className="h-24 w-24 object-cover rounded-lg border"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 md:flex-col md:w-40 md:items-stretch">
                  <button
                    onClick={() => act(post.id, "approve")}
                    disabled={actingId === post.id}
                    className="inline-flex items-center justify-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {actingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Approve
                  </button>
                  <button
                    onClick={() => act(post.id, "reject")}
                    disabled={actingId === post.id}
                    className="inline-flex items-center justify-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {actingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />} Reject
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {lightbox && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
              aria-label="Close image preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-5">
              <img
                src={lightbox.url}
                alt={lightbox.title || "Listing image"}
                className="w-full max-h-[70vh] object-contain rounded-2xl bg-black/5"
              />
              {lightbox.imageId && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(lightbox.postId, lightbox.imageId)}
                    disabled={deletingImageId === lightbox.imageId}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {deletingImageId === lightbox.imageId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete image
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
