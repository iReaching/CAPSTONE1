// src/components/Header.jsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Menu, UserCircle } from "lucide-react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
import ProfileModal from "./ProfileModal";
import AnimatedHamburger from "./AnimatedHamburger";

export default function Header({ onLogout, onMenuClick }) {
const [showModal, setShowModal] = useState(false);
const [announcements, setAnnouncements] = useState([]);
const [profileOpen, setProfileOpen] = useState(false);
const [profile, setProfile] = useState(null);
const [sidebarOpen, setSidebarOpen] = useState(false);
const role = localStorage.getItem("role"); 
const isNew = (datePosted) => {
  const posted = new Date(datePosted);
  const now = new Date();
  const diffInDays = (now - posted) / (1000 * 60 * 60 * 24);
  return diffInDays <= 3;
};
const formatDate = (dateStr) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
};

// Reset sidebar state when clicking outside or on route change
useEffect(() => {
  const handleClickOutside = (event) => {
    // If click is outside sidebar area and hamburger is open, close it
    if (sidebarOpen && !event.target.closest('.hamburger-menu') && !event.target.closest('nav')) {
      setSidebarOpen(false);
    }
  };

  const handleRouteChange = () => {
    // Reset hamburger state on route change
    setSidebarOpen(false);
  };

  document.addEventListener('click', handleClickOutside);
  window.addEventListener('popstate', handleRouteChange);

  return () => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('popstate', handleRouteChange);
  };
}, [sidebarOpen]);

useEffect(() => {
  // Fetch announcements
  fetch(`${BASE_URL}get_announcements.php`, { credentials: 'include' })
    .then(async res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setAnnouncements(Array.isArray(data) ? data : (data.announcements || []));
      } catch (parseError) {
        console.error('Failed to parse announcements JSON:', parseError);
        setAnnouncements([]);
      }
    })
    .catch(err => {
      console.error('Failed to fetch announcements:', err);
      setAnnouncements([]);
    });
    
  // Fetch profile
  const userId = localStorage.getItem('user_id');
  if (userId) {
    fetch(`${BASE_URL}get_profile.php?user_id=${userId}&t=${Date.now()}`, { credentials: 'include' })
      .then(async res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setProfile(data);
        } catch (parseError) {
          console.error('Failed to parse profile JSON:', parseError);
          setProfile(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
        setProfile(null);
      });
  }
}, []);

  return (
    <>
<header className="fixed top-0 left-0 right-0 h-16 bg-[var(--brand)] shadow z-40 flex items-center justify-between px-4 md:pl-64 border-b border-gray-200">
        {/* Hamburger (mobile) */}
        <div className="flex items-center gap-2">
          <AnimatedHamburger 
            isOpen={sidebarOpen} 
            onClick={() => {
              setSidebarOpen(!sidebarOpen);
              if (onMenuClick) onMenuClick();
            }}
            className="md:hidden hamburger-menu"
          />
        </div>

        <div className="flex items-center gap-4 text-white">
          {/* Notifications icon */}
          <button onClick={() => setShowModal(true)} className="relative">
            <Bell size={20} className="text-white hover:text-indigo-300 transition" />
          </button>
          {/* Profile avatar (opens Profile modal) */}
<button onClick={() => setProfileOpen(true)} aria-label="Profile" className="w-10 h-10 rounded-full overflow-hidden border border-white/30 bg-white/10 ring-1 ring-white/30 flex items-center justify-center">
            {!profile ? (
              // Loading state
              <div className="w-full h-full bg-indigo-300 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Always render a fallback icon so something is visible immediately */}
                <UserCircle className="w-6 h-6 text-white/90" />
                {/* If we have a filename, try to load it on top. If it errors, hide it and keep the icon. */}
                {profile.profile_picture ? (
                  <img
                    key={profile.profile_picture}
                    src={(profile.profile_picture.startsWith('http')
                      ? profile.profile_picture
                      : assetUrl(profile.profile_picture)) + '?v=' + Date.now()}
                    alt="Profile"
                    className="absolute w-10 h-10 object-cover rounded-full"
                    onError={(e) => {
                      // Hide broken image to reveal the icon
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
              </>
            )}
          </button>
        </div>
        {showModal && (
          <div className="fixed inset-1 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-lg">
              <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-3 text-gray-500 hover:text-black"
              >
                  &times;
              </button>
              <h2 className="text-xl font-bold text-indigo-600 mb-4">Latest Announcements</h2>
              <ul className="space-y-2 max-h-96 overflow-y-auto text-black">
                  {announcements.map((a, idx) => (
                  <div key={idx} className="border-b pb-3 mb-3 relative">
                      <h4 className="font-semibold text-indigo-600 flex items-center gap-2">
                      {a.subject}
                      {isNew(a.date_posted) && (
                          <span className="bg-red-500 text-white text-[10px] px-2 py-[2px] rounded-full">NEW</span>
                      )}
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">
                      {a.content.length > 100 ? a.content.substring(0, 100) + "..." : a.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(a.date_posted)}</p>
                  </div>
                  ))}
              </ul>
              <div className="mt-4 text-right">
                {(role === "admin" || role === "homeowner") && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      const path = role === "admin" ? "/announcement" : "/homeowner/announcements";
                      window.location.href = path;
                    }}
                    className="text-indigo-600 hover:underline text-sm"
                  >
                    View All Announcements →
                  </button>
                )}
              </div>
              </div>
          </div>
          )}
      </header>
      {profileOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <ProfileModal show={true} onClose={() => setProfileOpen(false)} onProfileUpdate={() => {
            const userId = localStorage.getItem('user_id');
            if (userId) {
              fetch(`${BASE_URL}get_profile.php?user_id=${userId}&t=${Date.now()}`, { credentials: 'include' })
                .then(async res => {
                  if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                  }
                  const text = await res.text();
                  try {
                    const data = JSON.parse(text);
                    setProfile(data);
                  } catch (parseError) {
                    console.error('Header - Failed to parse updated profile JSON:', parseError);
                  }
                })
                .catch(err => {
                  console.error('Header - Failed to refresh profile after update:', err);
                });
            }
          }} />
        </div>, document.body)}
    </>
  );
}

