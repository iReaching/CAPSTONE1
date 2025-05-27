// SidebarStaff.jsx
import { useState, useContext, createContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import { BASE_URL } from "../config";
import {
  Home as HomeIcon,
  CalendarDays,
  Boxes,
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

export default function SidebarStaff() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAmenitiesActive = location.pathname.startsWith("/amenities");
  const isItemsActive = location.pathname.startsWith("/items");

  const [expanded, setExpanded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profile, setProfile] = useState({});
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);

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
          <div onClick={() => setExpanded((curr) => !curr)} className="p-1 text-white hover:text-white cursor-pointer">
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </div>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 space-y-1">
            <SidebarItem icon={<HomeIcon size={20} />} text="Home" link="/staff_home" active={location.pathname === "/staff_home"} />

            <li className="relative">
              <Link to="#" onClick={(e) => { e.preventDefault(); if (!isAmenitiesActive) navigate("/amenities/view"); setAmenitiesOpen((prev) => !prev); }}
                className={`${isAmenitiesActive ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-gray-100 text-white"} flex items-center py-2 px-3 my-1 font-medium rounded-md transition-colors group`}>
                <CalendarDays size={20} />
                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>Amenities</span>
                {expanded && <div className="ml-auto">{amenitiesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>}
              </Link>
              {amenitiesOpen && expanded && (
                <ul className="ml-9 mt-1 space-y-1 text-sm">
                  <SidebarItem icon={<Eye size={20} />} text="View" link="/amenities/view" active={location.pathname === "/amenities/view"} />
                  <SidebarItem icon={<Plus size={20} />} text="Add" link="/amenities/add" active={location.pathname === "/amenities/add"} />
                  <SidebarItem icon={<Wrench size={20} />} text="Edit" link="/amenities/edit" active={location.pathname === "/amenities/edit"} />
                  <SidebarItem icon={<ScrollText size={20} />} text="Schedules" link="/amenities/schedules" active={location.pathname === "/amenities/schedules"} />
                </ul>
              )}
            </li>

            <li className="relative">
              <Link to="#" onClick={(e) => { e.preventDefault(); if (!isItemsActive) navigate("/items/view"); setItemsOpen((prev) => !prev); }}
                className={`${isItemsActive ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-gray-100 text-white"} flex items-center py-2 px-3 my-1 font-medium rounded-md transition-colors group`}>
                <Boxes size={20} />
                <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>Items</span>
                {expanded && <div className="ml-auto">{itemsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>}
              </Link>
              {itemsOpen && expanded && (
                <ul className="ml-9 mt-1 space-y-1 text-sm">
                  <SidebarItem icon={<Eye size={20} />} text="View" link="/items/view" active={location.pathname === "/items/view"} />
                  <SidebarItem icon={<Plus size={20} />} text="Add" link="/items/add" active={location.pathname === "/items/add"} />
                  <SidebarItem icon={<Wrench size={20} />} text="Edit" link="/items/edit" active={location.pathname === "/items/edit"} />
                  <SidebarItem icon={<ScrollText size={20} />} text="Schedule" link="/items/schedule" active={location.pathname === "/items/schedule"} />
                </ul>
              )}
            </li>

            <SidebarItem icon={<FileText size={20} />} text="Report" link="/reports" active={location.pathname === "/reports"} />
            <SidebarItem icon={<UserSquare size={20} />} text="Account" link="/account" active={location.pathname === "/account"} />
          </ul>
        </SidebarContext.Provider>

        <div className="p-3 flex items-center justify-between bg-[#4169B3]">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={
                profile.profile_picture?.startsWith("uploads/")
                  ? `${window.location.origin}/capstone1/${profile.profile_picture}`
                  : profile.profile_picture || `https://ui-avatars.com/api/?name=${profile.full_name || ""}`
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
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 shadow-md bg-[#4169B3] text-white rounded-md w-32 text-sm z-50">
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

export function SidebarItem({ icon, text, active, alert, link }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <Link to={link}>
      <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-gray-100 text-white hover:text-indigo-500"}`}>
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>{text}</span>
        {!expanded && (
          <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm opacity-0 group-hover:opacity-100 transition-all z-50">
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}
