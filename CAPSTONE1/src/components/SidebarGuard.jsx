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

export default function SidebarGuard({ isOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profile, setProfile] = useState({});

  const fetchProfile = () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`, { credentials: 'include' })
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
    <>
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40 md:hidden" aria-hidden="true" />}
      <aside className={`fixed top-0 left-0 z-50 h-screen transition-transform duration-300 ${expanded ? "w-64" : "w-20"} ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
<nav className="h-full flex flex-col bg-[var(--brand)]">
          <div className="p-4 pb-2 flex justify-between items-center">
            <button className="md:hidden text-white" onClick={onClose} aria-label="Close sidebar">✕</button>
          </div>

          <SidebarContext.Provider value={{ expanded }}>
            <ul className="flex-1 px-3 space-y-1">
              <SidebarItem icon={<HomeIcon size={20} />} text="Home" link="/guard_home" active={location.pathname === "/guard_home"} />
              <SidebarItem icon={<ClipboardList size={20} />} text="Existing Logs" link="/existinglogs" active={location.pathname === "/existinglogs"} />
            </ul>
          </SidebarContext.Provider>
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({ icon, text, active = false, link = "#" }) {
  const { expanded } = useContext(SidebarContext);
  const hasValidLink = link && link !== "#";

  const content = (
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group whitespace-nowrap ${
        active 
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" 
          : "hover:bg-gray-100 hover:text-indigo-500 text-white"
      }`}
    >
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
        {text}
      </span>
      {!expanded && (
        <div className="absolute left-full px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm rounded-md opacity-0 group-hover:opacity-100 transition-all z-50">
          {text}
        </div>
      )}
    </li>
  );

  if (hasValidLink) {
    try {
      return <Link to={link}>{content}</Link>;
    } catch (error) {
      console.warn(`Error rendering Link for ${text}:`, error);
      return content;
    }
  }
  
  return content;
}