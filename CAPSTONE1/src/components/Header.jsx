// src/components/Header.jsx
import { useState, useEffect } from "react";
import { LogOut, Bell } from "lucide-react";
import { BASE_URL } from "../config";

export default function Header({ onLogout }) {
const [showModal, setShowModal] = useState(false);
const [announcements, setAnnouncements] = useState([]);
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

useEffect(() => {
  fetch(`${BASE_URL}get_announcements.php`)
    .then(res => res.json())
    .then(data => setAnnouncements(data))
    .catch(err => console.error("Failed to fetch announcements", err));
}, []);

  return (
    
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#4169B3]  shadow z-40 flex justify-end items-center px-4 md:pl-64 border-b border-gray-200">
      <div className="flex items-center gap-4 text-white">
        {/* Notifications icon */}
        <button onClick={() => setShowModal(true)} className="relative">
        <Bell size={20} className="text-white hover:text-indigo-300 transition" />
        </button>


        {/* Logout button */}
        <button
          className="p-2 hover:text-red-600"
          onClick={onLogout}
        >
          <LogOut size={20} />
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
                    {a.body.length > 100 ? a.body.substring(0, 100) + "..." : a.body}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(a.date_posted)}</p>
                </div>
                ))}
            </ul>
            <div className="mt-4 text-right">
                {role !== "guard" && (
                <button
                    onClick={() => {
                    setShowModal(false);
                    const path =
                        role === "admin"
                        ? "/announcement"
                        : role === "staff"
                        ? "/staff/announcements"
                        : "/homeowner/announcements";
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
  );
  
}

