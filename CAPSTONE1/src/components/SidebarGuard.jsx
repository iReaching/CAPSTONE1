// src/components/SidebarGuard.jsx
import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import { BASE_URL } from "../config";
import {
  Home as HomeIcon,
  MoreVertical,
  ChevronFirst,
  ChevronLast,
  ClipboardList
} from "lucide-react";

const SidebarContext = createContext();

export default function SidebarGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profile, setProfile] = useState({});

  const fetchProfile = () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Profile fetch error:", err));
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside className={`fixed top-0 left-0 z-50 h-screen transition-all ${expanded ? "w-64" : "w-20"}`}>
      <nav className="h-full flex flex-col bg-[#4169B3]">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div onClick={() => setExpanded((curr) => !curr)} className="p-1 text-white hover:text-gray-300 cursor-pointer">
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </div>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 space-y-1">
            <SidebarItem icon={<HomeIcon size={20} />} text="Home" link="/guard_home" active={location.pathname === "/guard_home"} />
            <SidebarItem icon={<ClipboardList size={20} />} text="Existing Logs" link="/existinglogs" active={location.pathname === "/existinglogs"} />
          </ul>
        </SidebarContext.Provider>

        <div className="p-3 flex items-center justify-between bg-[#4169B3]">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={
                profile.profile_picture?.startsWith("uploads/")
                  ? `${window.location.origin}/capstone1/${profile.profile_picture}`
                  : profile.profile_picture || "https://ui-avatars.com/api/?name=" + (profile.full_name || "")
              }
              alt="Profile"
              className="w-10 h-10 rounded-md object-cover"
            />
            {expanded && (
              <div className="leading-4 text-white">
                <h4 className="font-semibold truncate">{profile.full_name || ""}</h4>
                <span className="text-xs text-white truncate">{profile.email || ""}</span>
              </div>
            )}
          </div>

          {expanded && (
            <div className="relative">
              <button onClick={() => setShowOptions((prev) => !prev)} className="p-1 text-white hover:text-white">
                <MoreVertical size={16} />
              </button>
              {showOptions && (
                <div className="absolute left-full top-1/4 -translate-y-1/2 ml-3 bg-[#4169B3] text-white shadow-md rounded-md w-32 text-sm z-50">
                  <ul className="py-1">
                    <li>
                      <button onClick={() => { setShowProfile(true); setShowOptions(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-indigo-600">Edit Profile</button>
                    </li>
                    <li>
                      <button onClick={handleLogOut} className="w-full text-left px-4 py-2 hover:bg-white hover:text-red-600">Log Out</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <ProfileModal show={showProfile} onClose={() => setShowProfile(false)} onProfileUpdate={fetchProfile} />
    </aside>
  );
}

export function SidebarItem({ icon, text, active, link }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <Link to={link}>
      <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group whitespace-nowrap ${active ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-gray-100 hover:text-indigo-500 text-white"}`}>
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
        {!expanded && (
          <div className="absolute left-full px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all z-50">
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}
