import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../config";
import { assetUrl } from "../../lib/asset";
import Page from "../../components/ui/Page";
import { Megaphone, ChevronLeft, ChevronRight } from "lucide-react";

function AnnouncementCarousel({ items }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);
  const n = items.length;

  const clamp = (i) => (i + n) % n;
  const prev = () => setIndex((i) => clamp(i - 1));
  const next = () => setIndex((i) => clamp(i + 1));
  const go = (i) => setIndex(clamp(i));

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx > 0 ? prev() : next(); }
    touchStartX.current = null;
  };

  const a = items[index] || {};
  const posted = (() => { try { return new Date(a.date_posted).toLocaleString(); } catch { return a.date_posted || ""; } })();
  const isNew = (() => { try { const d = new Date(a.date_posted); return (Date.now() - d.getTime()) / (1000*60*60*24) <= 3; } catch { return false; } })();
  const img = a.image_path ? assetUrl(a.image_path) : null;
  const avatar = a.poster_profile_pic ? assetUrl(a.poster_profile_pic) : null;

  const [lightbox, setLightbox] = useState(null);
  return (
    <div className="relative w-full" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full border" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{a.subject || a.title}</h3>
              <div className="text-xs text-gray-500 mt-1">{a.poster_name ? `By ${a.poster_name} • ` : ""}{posted}</div>
            </div>
          </div>
          {isNew && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">NEW</span>
          )}
        </div>
        {a.content && (
          <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{a.content}</div>
        )}
        {img && (
          <div className="mt-3">
            <button type="button" onClick={() => setLightbox(img)} className="block w-full">
              <img src={img} alt="Announcement" className="w-full max-h-80 object-cover rounded border-2 border-black" />
            </button>
          </div>
        )}
      </div>

      {n > 1 && (
        <>
          {/* Left chevron outside the card */}
          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-30 p-2 text-black hover:text-neutral-700 focus:outline-none pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6 text-black" />
          </button>

          {/* Right chevron outside the card */}
          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-30 p-2 text-black hover:text-neutral-700 focus:outline-none pointer-events-auto"
          >
            <ChevronRight className="w-6 h-6 text-black" />
          </button>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 py-3 z-20">
            {items.map((_, i) => (
              <span
                key={i}
                onClick={() => go(i)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer border ${i === index ? 'border-black bg-black' : 'border-black bg-transparent'}`}
              ></span>
            ))}
          </div>
        </>
      )}
      {lightbox && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={()=> setLightbox(null)}>
          <img src={lightbox} alt="full" className="max-w-[90vw] max-h-[85vh] object-contain rounded border bg-white" />
        </div>
      )}
    </div>
  );
}

export default function HomeownerAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}get_announcements.php`, { credentials: 'include' });
        const text = await res.text();
        const data = (() => { try { return JSON.parse(text); } catch { return []; } })();
        setItems(Array.isArray(data) ? data : (data.announcements || []));
      } catch (e) {
        console.error('Announcements fetch error', e);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <Page>
      <div className="max-w-5xl mx-auto w-full px-3">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Announcements</h1>
              <p className="text-gray-600 text-sm">Latest updates for residents</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No announcements yet.</div>
        ) : (
          <div className="relative w-full max-w-3xl mx-auto border rounded-2xl bg-white shadow-sm">
            <AnnouncementCarousel items={items} />
          </div>
        )}
      </div>
    </Page>
  );
}
