import { useState, useContext, useEffect, createContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import {
  Home,
  CalendarDays,
  Boxes,
  FileText,
  UserSquare,
  MoreVertical,
  ChevronFirst,
  ChevronLast,
  LogIn,
  Megaphone,
  DollarSign,
} from "lucide-react";
import ProfileModal from "./ProfileModal";

const SidebarContext = createContext();

export default function SidebarHomeowner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Profile fetch error:", err));
    }
  }, []);

  const handleLogOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside className={`fixed top-0 left-0 z-50 transition-all h-screen ${expanded ? "h-screen w-64" : "w-20"}`}>
    <nav className={`flex flex-col bg-[#4169B3] h-screen`}>
        {/* Top: Logo and Toggle Button */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <div onClick={() => setExpanded((curr) => !curr)} className="p-1 text-white hover:text-white cursor-pointer">
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </div>
        </div>

        {/* Navigation Items */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className={`${expanded ? "flex-1 px-3 space-y-1" : "px-3 space-y-1"}`}>
            <SidebarItem icon={<Home size={20} />} text="Home" link="/homeowner_home" active={location.pathname === "/homeowner_home"} />
            <SidebarItem icon={<CalendarDays size={20} />} text="Amenities" link="/amenities/view" active={location.pathname.startsWith("/amenities")} />
            <SidebarItem icon={<Boxes size={20} />} text="Items" link="/items/view" active={location.pathname.startsWith("/items")} />
            <SidebarItem icon={<FileText size={20} />} text="Borrow Amenity" link="/homeowner/borrow_amenities" active={location.pathname === "/homeowner/borrow_amenities"} />
            <SidebarItem icon={<FileText size={20} />} text="Borrow Item" link="/homeowner/borrow_item" active={location.pathname === "/homeowner/borrow_item"} />
            <SidebarItem icon={<FileText size={20} />} text="Submit Report" link="/homeowner/submit_report" active={location.pathname === "/homeowner/submit_report"} />
            <SidebarItem icon={<UserSquare size={20} />} text="Register Vehicle" link="/homeowner/register_vehicle" active={location.pathname === "/homeowner/register_vehicle"} />
            <SidebarItem icon={<LogIn size={20} />} text="Entry Log Request" link="/homeowner/request_entry" active={location.pathname === "/homeowner/request_entry"} />
            <SidebarItem icon={<FileText size={20} />} text="Visitor Logs" link="/homeowner/visitor_logs" active={location.pathname === "/homeowner/visitor_logs"} />
            <SidebarItem icon={<UserSquare size={20} />} text="Manage Vehicles" link="/homeowner/manage_vehicles" active={location.pathname === "/homeowner/manage_vehicles"} />
            <SidebarItem icon={<Megaphone size={20} />} text="Announcements" link="/homeowner/announcements" active={location.pathname === "/homeowner/announcements"} />
            <SidebarItem icon={<DollarSign size={20} />} text="Monthly Dues" link="/homeowner/dues" active={location.pathname === "/homeowner/dues"} />
          </ul>
        </SidebarContext.Provider>

        {/* Footer: User Info */}
            <div className="p-3 flex items-center justify-between bg-[#4169B3]">
            {/* Profile Info */}
            <div className="flex-1 items-center gap-3 overflow-hidden">
            <img
              src={
                profile.profile_picture?.startsWith("uploads/")
                  ? `${BASE_URL}${profile.profile_picture}`
                  : profile.profile_picture || "https://ui-avatars.com/api/?name=" + (profile.full_name || "")
              }
              alt="Profile"
              className="w-10 h-10 rounded-md object-cover"
            />

                {expanded && (
                <div className="leading-4 text-white">
                    <h4 className="font-semibold truncate"> {profile.full_name ? profile.full_name : ""}</h4>
                    <span className="text-xs text-white truncate">{profile.email || ""}</span>
                </div>
                )}
            </div>

            {/* Options Menu Trigger */}
            {expanded && (
                <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowOptions((prev) => !prev)}
                  className="appearance-none p-1 text-white hover:text-white bg-transparent border-none shadow-none outline-none focus:outline-none focus:ring-0"
                >
                  <MoreVertical size={16} />
                </button>
                {/* Options Menu */}
                {showOptions && (
                    <div className="absolute left-full top-1/8 -translate-y-1/2 ml-3 shadow-md text-white bg-[#4169B3] rounded-md w-30 text-sm">
                    <ul className="py-1">
                        <li>
                        <button
                            onClick={() => {
                            setShowProfile(true);
                            setShowOptions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-indigo-600"
                        >
                            Edit Profile
                        </button>
                        </li>
                        <li>
                        <button
                            onClick={() => {
                            handleLogOut();
                            setShowOptions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-white hover:text-red-600"
                        >
                            Log Out
                        </button>
                        </li>
                    </ul>
                    </div>
                )}
                </div>
            )}
            </div>

      </nav>

      <ProfileModal show={showProfile} onClose={() => setShowProfile(false)} onProfileUpdate={() => fetchProfile()} />
    </aside>
  );
}

export function SidebarItem({ icon, text, active, link }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <Link to={link}>
            <li
        className={`relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer
          transition-colors group whitespace-nowrap
          ${active 
        ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" 
        : "text-white hover:text-indigo-600 hover:bg-gray-100"}`}
      >
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
