// SidebarStaff.jsx
import { useState, useContext, createContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import { BASE_URL } from "../config";
import {
  Home as HomeIcon,
  CalendarDays,
  FileText,
  ScrollText,
  UserSquare,
  Eye,
  Plus,
  Wrench,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  ChevronFirst,
  ChevronLast
} from "lucide-react";

const SidebarContext = createContext();

export default function SidebarStaff({ isOpen = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isAmenitiesActive = false;
  const isItemsActive = false; // Items removed across roles

  const [expanded, setExpanded] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profile, setProfile] = useState({});
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  // const [itemsOpen, setItemsOpen] = useState(false); // removed

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
              <SidebarItem icon={<HomeIcon size={20} />} text="Home" link="/staff_home" active={location.pathname === "/staff_home"} />
              <SidebarItem icon={<ScrollText size={20} />} text="Monthly Dues" link="/dues" active={location.pathname === "/dues"} />

              {/* Amenities removed for Finance-focused staff */}

              {/* Items section removed */}

              {/* Account removed for Staff UI/UX per requirements */}
            </ul>
          </SidebarContext.Provider>
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({ icon, text, active = false, alert = false, link = "#" }) {
  const { expanded } = useContext(SidebarContext);
  const hasValidLink = link && link !== "#";

  const content = (
    <li
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group whitespace-nowrap ${
        active 
          ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" 
          : "hover:bg-gray-100 text-white hover:text-indigo-500"
      }`}
    >
      {icon}
      <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
        {text}
      </span>
      {!expanded && (
        <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm opacity-0 group-hover:opacity-100 transition-all z-50">
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