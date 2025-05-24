import { useState, useContext, createContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  DollarSign
} from "lucide-react";
import ProfileModal from "./ProfileModal";

const SidebarContext = createContext();

export default function SidebarHomeowner({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`http://localhost/vitecap1/capstone1/php/get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Profile fetch error:", err));
    }
  }, []);

  const fetchProfile = () => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`http://localhost/vitecap1/capstone1/php/get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Profile fetch error:", err));
    }
  };

  const handleLogOut = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <aside className={`fixed top-0 left-0 z-50 h-screen bg-white border-r shadow-sm transition-all ${expanded ? "w-64" : "w-16"}`}>
      <nav className="h-full flex flex-col bg-white border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div onClick={() => setExpanded((curr) => !curr)} className="p-1 text-black hover:text-gray-600 cursor-pointer">
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </div>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
        <ul className="flex-1 px-3 space-y-1">
            <SidebarItem icon={<Home size={16} />} text="Home" link="/homeowner_home" active={location.pathname === "/homeowner_home"} />
            <SidebarItem icon={<CalendarDays size={16} />} text="Amenities" link="/amenities/view" active={location.pathname.startsWith("/amenities")} />
            <SidebarItem icon={<Boxes size={16} />} text="Items" link="/items/view" active={location.pathname.startsWith("/items")} />
            <SidebarItem icon={<FileText size={16} />} text="Borrow Amenity" link="/homeowner/borrow_amenities" active={location.pathname === "/homeowner/borrow_amenities"} />
            <SidebarItem icon={<FileText size={16} />} text="Borrow Item" link="/homeowner/borrow_item" active={location.pathname === "/homeowner/borrow_item"} />
            <SidebarItem icon={<FileText size={16} />} text="Submit Report" link="/homeowner/submit_report" active={location.pathname === "/homeowner/submit_report"} />
            <SidebarItem icon={<UserSquare size={16} />} text="Register Vehicle" link="/homeowner/register_vehicle" active={location.pathname === "/homeowner/register_vehicle"} />
            <SidebarItem icon={<LogIn size={16} />} text="Entry Log Request" link="/homeowner/request_entry" active={location.pathname === "/homeowner/request_entry"} />
            <SidebarItem icon={<FileText size={16} />} text="Visitor Logs" link="/homeowner/visitor_logs" active={location.pathname === "/homeowner/visitor_logs"} />
            <SidebarItem icon={<UserSquare size={16} />} text="Manage Vehicles" link="/homeowner/manage_vehicles" active={location.pathname === "/homeowner/manage_vehicles"} />
            <SidebarItem icon={<Megaphone size={16} />} text="Announcements" link="/homeowner/announcements" active={location.pathname === "/homeowner/announcements"} /> 
            <SidebarItem icon={<DollarSign size={16} />} text="Monthly Dues" link="/homeowner/dues" active={location.pathname === "/homeowner/dues"} />


            </ul>
        </SidebarContext.Provider>

        <div className="border-t p-3 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={
                profile.profile_picture?.startsWith("uploads/")
                  ? `http://localhost/vitecap1/capstone1/${profile.profile_picture}`
                  : profile.profile_picture || `https://ui-avatars.com/api/?name=${profile.full_name || ""}`
              }
              alt="Profile"
              className="w-10 h-10 rounded-md object-cover"
            />
            {expanded && (
              <div className="leading-4 text-gray-800">
                <h4 className="font-semibold truncate">{profile.full_name || ""}</h4>
                <span className="text-xs text-gray-500 truncate">{profile.email || ""}</span>
              </div>
            )}
          </div>

          {expanded && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowOptions((prev) => !prev)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <MoreVertical size={16} />
              </button>
              {showOptions && (
                <div className="absolute left-full top-1/3 -translate-y-1/2 ml-3 shadow-md text-white rounded-md w-40 z-50 text-sm">
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
                        onClick={handleLogOut}
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

      <ProfileModal
        show={showProfile}
        onClose={() => setShowProfile(false)}
        onProfileUpdate={fetchProfile}
      />
    </aside>
  );
}

export function SidebarItem({ icon, text, active, link }) {
  const { expanded } = useContext(SidebarContext);

  return (
    <Link to={link}>
      <li className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ? "bg-gradient-to-tr from-indigo-160 to-indigo-100 text-indigo-800" : "hover:bg-indigo-50 text-gray-600"}`}>
        {icon}
        <span className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}`}>
          {text}
        </span>
        {!expanded && (
          <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-16 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}
