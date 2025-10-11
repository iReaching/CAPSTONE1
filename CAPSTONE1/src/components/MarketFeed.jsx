import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
import { buildMarketplaceDescription, parseMarketplaceDescription } from "../lib/marketplace";
import { Megaphone, Loader2, Send, User, MapPin, ShoppingBag, Phone, Info, X, Plus } from "lucide-react";

const INITIAL_FORM = {
  category: "for_sale",
  title: "",
  overview: "",
  price: "",
  purchaseLocation: "",
  purchaseInstructions: "",
  contactInfo: "",
  pickupDate: null,
  images: null,
  previews: []
};

export default function MarketFeed({ role }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [detailPost, setDetailPost] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  const isHomeowner = role === "homeowner";

  const listings = useMemo(
    () =>
      posts.map((post) => ({
        ...post,
        marketplace: parseMarketplaceDescription(post.description)
      })),
    [posts]
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [detailPost]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}get_market_posts.php?status=approved`, {
        credentials: "include"
      });
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("market feed load", error);
    } finally {
      setLoading(false);
    }
  };

  const notify = (message, type = "success") => {
    const el = document.createElement("div");
    el.className = `fixed top-20 right-4 ${
      type === "success" ? "bg-green-600" : "bg-red-600"
    } text-white px-4 py-2 rounded-lg shadow z-50`;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  };

  const handleFileChange = (files) => {
    if (!files || files.length === 0) {
      setForm((prev) => ({ ...prev, images: null, previews: [] }));
      return;
    }

    const previews = Array.from(files).map((file) => URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, images: files, previews }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const { overview, purchaseInstructions, purchaseLocation, contactInfo, pickupDate } = form;
    if (!overview.trim() && !purchaseInstructions.trim()) {
      notify("Please provide overview or buying instructions.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("category", form.category);
      fd.append("title", form.title.trim());
      fd.append(
        "description",
        buildMarketplaceDescription({
          overview: form.overview,
          purchaseInstructions,
          purchaseLocation,
          contactInfo,
          pickupDate: pickupDate ? pickupDate.toISOString() : ""
        })
      );
      if (form.price !== "") {
        fd.append("price", form.price);
      }
      if (form.images && form.images.length > 0) {
        Array.from(form.images).forEach((file) => fd.append("images[]", file));
      }

      const response = await fetch(`${BASE_URL}create_market_post.php`, {
        method: "POST",
        body: fd,
        credentials: "include"
      });
      const data = await response.json();
      if (data.success) {
        notify("Listing submitted for admin approval");
        setShowComposer(false);
        setForm(INITIAL_FORM);
        fetchPosts();
      } else {
        throw new Error(data.message || "Failed to submit listing");
      }
    } catch (error) {
      console.error(error);
      notify(error.message || "Failed to submit listing", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const galleryForPost = (post) => {
    if (!post) return [];
    if (post.images && post.images.length > 0) {
      return post.images.map((img) => (typeof img === "string" ? img : img.path));
    }
    if (post.image_path) {
      return [post.image_path];
    }
    return [];
  };

  const openDetail = (post) => {
    setDetailPost(post);
  };

  const closeDetail = () => {
    setDetailPost(null);
  };

  const detailMeta = detailPost ? parseMarketplaceDescription(detailPost.description) : null;
  const detailGallery = detailPost ? galleryForPost(detailPost) : [];
  const activeDetailImage = detailGallery.length > 0 ? detailGallery[Math.min(activeImageIndex, detailGallery.length - 1)] : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Community Marketplace</h3>
            <p className="text-sm text-gray-600">Browse listings from your neighbors and see what is available.</p>
          </div>
        </div>
        {isHomeowner && (
          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Marketplace Listing
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b">
          <h4 className="font-semibold text-gray-900">Latest Listings</h4>
        </div>
        {loading ? (
          <div className="p-6 flex items-center justify-center text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading feed...
          </div>
        ) : listings.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No posts yet. Check back soon.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {listings.map((post) => {
              const gallery = galleryForPost(post);
              const cover = gallery.length > 0 ? gallery[0] : null;
              const parsed = post.marketplace;

              return (
                <article
                  key={post.id}
                  className="h-full bg-gradient-to-br from-white to-indigo-50/30 rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{post.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-2">
                        <span>{new Date(post.created_at).toLocaleString()}</span>
                        <span>|</span>
                        <span
                          className={`px-2 py-0.5 rounded-full capitalize ${
                            post.category === "for_sale" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {post.category === "for_sale" ? "For Sale" : "For Rent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {cover && (
                    <div className="mt-4">
                      <img
                        src={assetUrl(cover)}
                        alt={post.title}
                        className="w-full h-44 object-cover rounded-xl border border-gray-100 cursor-pointer"
                        onClick={() => {
                          openDetail(post);
                          setTimeout(() => {
                            setLightboxImage({ url: assetUrl(cover), title: post.title });
                          }, 0);
                        }}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-700 line-clamp-3">
                    {parsed.overview || parsed.raw || "No description provided."}
                  </div>

                  {post.price !== null && post.price !== undefined && post.price !== "" && (
                    <div className="mt-3 font-semibold text-indigo-700 text-sm">
                      PHP {Number(post.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
                  )}

                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => openDetail(post)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold inline-flex items-center gap-2"
                    >
                      <Info className="w-4 h-4" /> View Listing
                    </button>
                    {parsed.purchaseLocation && (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" /> {parsed.purchaseLocation}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {showComposer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setShowComposer(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              aria-label="Close composer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Share a Marketplace Listing</h2>
                  <p className="text-sm text-gray-600">
                    Explain what you are offering and guide neighbors on how to purchase. Transactions remain offline.
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={form.category}
                      onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={submitting}
                      required
                    >
                      <option value="for_sale">For Sale</option>
                      <option value="for_rent">For Rent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (optional)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.00"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Example: Homemade baked goodies"
                    maxLength={120}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
                  <textarea
                    value={form.overview}
                    onChange={(event) => setForm((prev) => ({ ...prev, overview: event.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={3}
                    placeholder="Describe the item, condition, and what is included."
                    maxLength={500}
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Where to buy / meet</label>
                    <input
                      type="text"
                      value={form.purchaseLocation}
                      onChange={(event) => setForm((prev) => ({ ...prev, purchaseLocation: event.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Example: Tower B lobby, clubhouse, online link"
                      maxLength={160}
                      disabled={submitting}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred schedule (optional)
                    </label>
                    <DatePicker
                      selected={form.pickupDate}
                      onChange={(date) =>
                        setForm((prev) => ({
                          ...prev,
                          pickupDate: date,
                        }))
                      }
                      showTimeSelect
                      timeIntervals={30}
                      minDate={new Date()}
                      placeholderText="Select date and time"
                      dateFormat="MMM d, yyyy h:mm a"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      wrapperClassName="w-full"
                      popperPlacement="bottom-start"
                      disabled={submitting}
                      isClearable
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How to buy</label>
                  <textarea
                    value={form.purchaseInstructions}
                    onChange={(event) => setForm((prev) => ({ ...prev, purchaseInstructions: event.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={4}
                    placeholder="Explain the steps: message first, confirm availability, pay via cash or GCASH, etc."
                    maxLength={800}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">How to contact you</label>
                  <input
                    type="text"
                    value={form.contactInfo}
                    onChange={(event) => setForm((prev) => ({ ...prev, contactInfo: event.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Example: 0917-1234567 (Viber) or unit 8C or your Facebook link/Facebook name"
                    maxLength={160}
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos (up to 5)</label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-indigo-300 text-indigo-600 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors text-sm font-medium">
                      Upload images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(event) => handleFileChange(event.target.files)}
                        disabled={submitting}
                      />
                    </label>
                    <span className="text-xs text-gray-500">JPEG or PNG, max 5 MB each</span>
                  </div>
                  {form.previews.length > 0 && (
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {form.previews.map((src, index) => (
                        <img key={index} src={src} alt={`preview-${index}`} className="h-20 w-20 object-cover rounded-lg border" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowComposer(false)}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit for approval
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {detailPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={closeDetail}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full capitalize ${
                      detailPost.category === "for_sale" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {detailPost.category === "for_sale" ? "For Sale" : "For Rent"}
                  </span>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">{detailPost.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">Posted {new Date(detailPost.created_at).toLocaleString()}</div>
                </div>
                {detailPost.price !== null && detailPost.price !== undefined && detailPost.price !== "" && (
                  <div className="text-2xl font-semibold text-indigo-600 mt-6 sm:mt-4">
                    PHP {Number(detailPost.price).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </div>
                )}
              </header>

              {activeDetailImage && (
                <div>
                  <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100">
                    <img
                      src={assetUrl(activeDetailImage)}
                      alt={detailPost.title}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightboxImage({ url: assetUrl(activeDetailImage), title: detailPost.title })}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  {detailGallery.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {detailGallery.map((img, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setActiveImageIndex(index)}
                          className={`h-16 w-16 rounded-xl border ${
                            index === activeImageIndex ? "border-indigo-500 ring-2 ring-indigo-400" : "border-transparent"
                          } overflow-hidden flex-shrink-0`}
                        >
                          <img
                            src={assetUrl(img)}
                            alt={`${detailPost.title} ${index + 1}`}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailMeta && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <section className="lg:col-span-2 space-y-4">
                    {detailMeta.overview && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Overview</h3>
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{detailMeta.overview}</p>
                      </div>
                    )}
                    {detailMeta.purchaseInstructions && (
                      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                        <div className="flex items-center gap-2 text-indigo-700 font-medium">
                          <ShoppingBag className="w-4 h-4" /> How to buy
                        </div>
                        <p className="mt-2 text-sm text-indigo-900 whitespace-pre-wrap">{detailMeta.purchaseInstructions}</p>
                      </div>
                    )}
                  </section>
                  <aside className="space-y-3">
                    {detailMeta.purchaseLocation && (
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <MapPin className="w-4 h-4 text-indigo-600" /> Where to buy or meet
                        </div>
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{detailMeta.purchaseLocation}</p>
                      </div>
                    )}
                    {(detailMeta.pickupDate || detailMeta.pickupWindow) && (
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Info className="w-4 h-4 text-indigo-600" /> Preferred schedule
                        </div>
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                          {detailMeta.pickupDate
                            ? (() => {
                                try {
                                  return new Date(detailMeta.pickupDate).toLocaleString();
                                } catch {
                                  return detailMeta.pickupDate;
                                }
                              })()
                            : detailMeta.pickupWindow}
                        </p>
                      </div>
                    )}
                    {detailMeta.contactInfo && (
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <Phone className="w-4 h-4 text-indigo-600" /> Contact the seller
                        </div>
                        <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{detailMeta.contactInfo}</p>
                      </div>
                    )}
                  </aside>
                </div>
              )}

              <footer className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
                Coordinate payments and meetups directly with the other party. CondoLink only assists with listings.
              </footer>
            </div>
          </div>
        </div>
      )}

      {lightboxImage && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 text-gray-200 hover:text-white"
              aria-label="Close image preview"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title || "Listing image"}
                className="w-full max-h-[75vh] object-contain rounded-2xl bg-black/5"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
