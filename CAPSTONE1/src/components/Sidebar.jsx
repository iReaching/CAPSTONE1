import { useState, useContext, createContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  ChevronLast,
  Megaphone,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";



// Create a context to share sidebar expansion state with SidebarItem
const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAmenitiesActive = [
    "/amenities/view",
    "/amenities/add",
    "/amenities/edit",
    "/amenities/schedules"
  ].includes(location.pathname);
  
  const isItemsActive = [
    "/items/view",
    "/items/add",
    "/items/edit",
    "/items/schedule"
  ].includes(location.pathname);
  
  const [itemsOpen, setItemsOpen] = useState(false);
  

  const [expanded, setExpanded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profile, setProfile] = useState({});
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  


  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Profile fetch error:", err));
    }
  }, []);

  const fetchProfile = () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Profile fetch error:", err));
    }
  };
  
  // Simulate log out function
  const handleLogOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  
  useEffect(() => {
    fetchProfile();
  }, []);
  

  return (
    <aside
      className={`fixed top-0 left-0 z-50 h-screen bg-[#4169B3] transition-all ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <nav className="h-full flex flex-col bg-[#4169B3]">
        {/* Top: Logo and Toggle Button */}
        <div className="p-4 pb-2 flex justify-between items-center">

          <div
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1 text-white hover:text-white cursor-pointer"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </div>
        </div>

        {/* Navigation Items */}
        <SidebarContext.Provider value={{ expanded }}>
        <ul className="flex-1 px-3 space-y-1">
        <SidebarItem icon={<HomeIcon size={20} />} text="Home" link="/home" active={location.pathname === "/home"} />

        <li className="relative">
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            if (!isAmenitiesActive) {
              navigate("/amenities/view");
            }
            setAmenitiesOpen((prev) => !prev);
          }}
          className={`
            flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer
            transition-colors group w-full
            ${isAmenitiesActive ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-gray-50 text-white"}
          `}               
          >
            <CalendarDays size={20} />
            <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
              Amenities
            </span>

            {!expanded && (
              <div
                className={`
                  absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 rounded-md
                  bg-indigo-100 text-indigo-800 text-sm whitespace-nowrap
                  opacity-0 group-hover:opacity-100 transition-all z-50
                `}
              >
                Amenities
              </div>
            )}

            {expanded && (
              <div className="ml-auto">
                {amenitiesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
          </Link>

          {/* Dropdown Items (only show when expanded) */}
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
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              if (!isItemsActive) {
                navigate("/items/view");
              }
              setItemsOpen((prev) => !prev);
            }}
            className={`
              flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer
              transition-colors group w-full
              ${isItemsActive ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-gray-50 text-white"}
            `}
          >
            <Boxes size={18} />
            <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
              Items
            </span>

            {!expanded && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 rounded-md bg-indigo-100 text-indigo-800 text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all z-50">
                Items
              </div>
            )}

            {expanded && (
              <div className="ml-auto">
                {itemsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
          </Link>

          {itemsOpen && expanded && (
            <ul className="ml-9 mt-1 space-y-1 text-sm">
              <SidebarItem icon={<Eye size={16} />} text="View" link="/items/view" active={location.pathname === "/items/view"} />
              <SidebarItem icon={<Plus size={16} />} text="Add" link="/items/add" active={location.pathname === "/items/add"} />
              <SidebarItem icon={<Wrench size={16} />} text="Edit" link="/items/edit" active={location.pathname === "/items/edit"} />
              <SidebarItem icon={<ScrollText size={16} />} text="Schedule" link="/items/schedule" active={location.pathname === "/items/schedule"} />
            </ul>
          )}
        </li>

        <SidebarItem icon={<FileText size={18} />} text="Report" link="/reports" active={location.pathname === "/reports"} />
        <SidebarItem icon={<ScrollText size={18} />} text="Entry Log" link="/entrylog" active={location.pathname === "/entrylog"} />
        <SidebarItem icon={<ScrollText size={18} />} text="System Logs" link="/system_logs" active={location.pathname === "/admin/system_logs"} />
        <SidebarItem icon={<UserSquare size={18} />} text="Account" link="/account" active={location.pathname === "/account"} />
        <SidebarItem icon={<Megaphone size={18} />} text="Announcement" link="/announcement" active={location.pathname === "/announcement"} />
        <SidebarItem icon={<DollarSign size={18} />} text="Monthly Dues" link="/dues" />

        </ul>
        </SidebarContext.Provider>

        {/* Footer: User Info */}
            <div className="p-3 flex items-center justify-between bg-[#4169B3]">
            {/* Profile Info */}
            <div className="flex items-center gap-3 overflow-hidden">
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

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <ProfileModal
            show={true}
            onClose={() => setShowProfile(false)}
            onProfileUpdate={fetchProfile}
          />
        </div>
      )}
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert, link }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <Link to={link}>
      <li
        className={`relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer
          transition-colors group
          ${active 
        ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" 
        : "text-white hover:text-indigo-600 hover:bg-gray-100"}`}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>

        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded-full bg-indigo-400 ${
              expanded ? "" : "top-2"
            }`}
          />
        )}

        {!expanded && (
          <div
            className={`absolute left-full rounded-md px-2 py-1 ml-6
            bg-indigo-100 text-indigo-800 text-sm
            invisible opacity-20 -translate-x-3 transition-all
            group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}
