import React, { useEffect, useState } from "react";
import { BASE_URL } from "../config";
import { Megaphone, Loader2, ChevronRight } from "lucide-react";
import { assetUrl } from "../lib/asset";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function AnnouncementsPanel({
  role,
  limit = 3,
  className = "",
  showViewAll = true,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let abort = false;
    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${BASE_URL}get_announcements.php`, {
          credentials: "include",
        });
        const text = await res.text();
        const payload = JSON.parse(text);
        if (!abort) {
          const list = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.announcements)
              ? payload.announcements
              : [];
          setItems(list.slice(0, limit));
        }
      } catch (err) {
        if (!abort) {
          console.error("Announcements fetch failed:", err);
          setError("Unable to load announcements right now.");
        }
      } finally {
        if (!abort) setLoading(false);
      }
    };
    run();
    return () => {
      abort = true;
    };
  }, [limit]);

  const viewAllHref =
    role === "homeowner"
      ? "/homeowner/announcements"
      : role === "admin"
        ? "/announcement"
        : role === "staff"
          ? "/homeowner/announcements"
          : role === "guard"
            ? "/homeowner/announcements"
            : "/home";

  return (
    <div
      className={`bg-white border border-gray-100 shadow-sm rounded-2xl p-5 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Community Announcements
            </h2>
            <p className="text-xs text-gray-500">
              Stay updated with the latest condo notices.
            </p>
          </div>
        </div>
        {showViewAll && items.length > 0 && role !== "admin" && (
          <a
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading announcements...
        </div>
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-500">No announcements posted yet.</div>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="border border-indigo-50 rounded-xl p-4 bg-indigo-50/40"
            >
              <div className="flex items-start gap-3">
                {item.poster_profile_pic ? (
                  <img
                    src={assetUrl(item.poster_profile_pic)}
                    alt={item.poster_name || "Profile"}
                    className="w-10 h-10 rounded-full object-cover border border-white shadow"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold">
                    {(item.poster_name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.title || item.subject || "Untitled announcement"}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(item.date_posted)}
                    </span>
                  </div>
                  {item.content && (
                    <p className="mt-1 text-sm text-gray-700 line-clamp-3">
                      {item.content}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
