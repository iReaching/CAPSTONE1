import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import SidebarStaff from "./components/SidebarStaff";
import SidebarGuard from "./components/SidebarGuard";
import SidebarHomeowner from "./components/SidebarHomeowner";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import Home from "./pages/Home";
import StaffHome from "./pages/StaffHome";
import GuardHome from "./pages/GuardHome";
import HomeownerHome from "./pages/HomeownerHome";
import AdminDues from "./pages/AdminDues";
import Amenities from "./pages/Amenities";
import Items from "./pages/Items";
import Reports from "./pages/Reports";
import EntryLog from "./pages/EntryLog";
import Account from "./pages/Account";

import AmenityView from "./pages/amenitiesSUB/AmenityView";
import AmenityAdd from "./pages/amenitiesSUB/AmenityAdd";
import AmenityEdit from "./pages/amenitiesSUB/AmenityEdit";
import AmenitySchedules from "./pages/amenitiesSUB/AmenitySchedules";

import ItemsView from "./pages/itemsSUB/ItemsView";
import ItemsAdd from "./pages/itemsSUB/ItemsAdd";
import ItemsEdit from "./pages/itemsSUB/ItemsEdit";
import ItemsSchedule from "./pages/itemsSUB/ItemsSchedule";
import EntryLogRequest from "./pages/homeownerSUB/EntryLogRequest";
import SystemLogs from "./pages/SystemLogs";

import Index from "./pages/Index";
import Login from "./pages/Login";
import HomeownerDues from "./pages/homeownerSUB/HomeownerDues";
import BorrowItem from "./pages/homeownerSUB/BorrowItem";
import BorrowAmenities from "./pages/homeownerSUB/BorrowAmenities";
import RegisterVehicle from "./pages/homeownerSUB/RegisterVehicle";
import SubmitReport from "./pages/homeownerSUB/SubmitReport";
import VisitorLogHistory from "./pages/homeownerSUB/VisitorLogHistory";
import HomeownerAnnouncements from "./pages/homeownerSUB/HomeownerAnnouncements";
import ManageVehicles from './pages/homeownerSUB/ManageVehicles';

import {
  Home as HomeIcon,
  CalendarDays,
  Boxes,
  FileText,
  ScrollText,
  UserSquare,
  Megaphone
} from "lucide-react";

export default function App() {
  const [loginState, setLoginState] = useState(Date.now()); // change triggers rerender
  const handleLogin = () => {
    setLoginState(Date.now()); // force AppLayout re-render with new localStorage role
  };
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Protected role-based layout */}
        <Route
          path="/*"
          element={
            localStorage.getItem("user_id") ? (
              <AppLayout key={loginState} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

// Layout and routing based on user role
function AppLayout() {
  const role = localStorage.getItem("role");

  // ADMIN
  if (role === "admin") {
    return (
      <div className="bg-gray-900 min-h-screen text-white relative">
        <Sidebar>
          <SidebarItem icon={<HomeIcon size={30} />} text="Home" link="/home" />
          <SidebarItem icon={<CalendarDays size={30} />} text="Amenities" link="/amenities" />
          <SidebarItem icon={<Boxes size={30} />} text="Items" link="/items" />
          <SidebarItem icon={<FileText size={30} />} text="Report" link="/reports" />
          <SidebarItem icon={<ScrollText size={30} />} text="Entry Log" link="/entrylog" />
          <SidebarItem icon={<UserSquare size={30} />} text="Account" link="/account" />
          <SidebarItem icon={<Megaphone size={30} />} text="Announcement" link="/announcements" />

        </Sidebar>

        <main className="absolute top-0 left-0 right-0 min-h-screen pt-10 pr-4 pl-16 md:pl-64 bg-[#0e1525] text-white overflow-x-auto transition-all duration-300">          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/amenities/view" element={<AmenityView />} />
            <Route path="/amenities/add" element={<AmenityAdd />} />
            <Route path="/amenities/edit" element={<AmenityEdit />} />
            <Route path="/amenities/schedules" element={<AmenitySchedules />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/view" element={<ItemsView />} />
            <Route path="/items/add" element={<ItemsAdd />} />
            <Route path="/items/edit" element={<ItemsEdit />} />
            <Route path="/items/schedule" element={<ItemsSchedule />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/entrylog" element={<EntryLog />} />
            <Route path="/system_logs" element={<SystemLogs />} /> {/* <- New Route */}
            <Route path="/account" element={<Account />} />
            <Route path="/announcement" element={<AdminAnnouncements />} />
            <Route path="/dues" element={<AdminDues />} />
          </Routes>
        </main>
      </div>
    );
  }

  // STAFF
  if (role === "staff") {
    return (
      <div className="bg-gray-900 min-h-screen text-white relative">
        <SidebarStaff>
          <SidebarItem icon={<HomeIcon size={30} />} text="Home" link="/staff_home" />
          <SidebarItem icon={<CalendarDays size={30} />} text="Amenities" link="/amenities" />
          <SidebarItem icon={<Boxes size={30} />} text="Items" link="/items" />
          <SidebarItem icon={<FileText size={30} />} text="Report" link="/reports" />
          <SidebarItem icon={<UserSquare size={30} />} text="Account" link="/account" />
        </SidebarStaff>

        <main className="absolute top-0 left-0 right-0 min-h-screen pt-10 pr-4 pl-16 md:pl-64 bg-[#0e1525] text-white overflow-x-auto transition-all duration-300">          <Routes>
            <Route path="/" element={<Navigate to="/staff_home" />} />
            <Route path="/staff_home" element={<StaffHome />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/amenities/view" element={<AmenityView />} />
            <Route path="/amenities/add" element={<AmenityAdd />} />
            <Route path="/amenities/edit" element={<AmenityEdit />} />
            <Route path="/amenities/schedules" element={<AmenitySchedules />} />
            <Route path="/items" element={<Items />} />
            <Route path="/items/view" element={<ItemsView />} />
            <Route path="/items/add" element={<ItemsAdd />} />
            <Route path="/items/edit" element={<ItemsEdit />} />
            <Route path="/items/schedule" element={<ItemsSchedule />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </main>
      </div>
    );
  }

  // GUARD
  if (role === "guard") {
    return (
      <div className="bg-gray-900 min-h-screen text-white relative">
        <SidebarGuard />
        <main className="absolute top-0 left-0 right-0 min-h-screen pt-10 pr-4 pl-16 md:pl-64 bg-[#0e1525] text-white overflow-x-auto transition-all duration-300">          <Routes>
            <Route path="/" element={<Navigate to="/guard_home" />} />
            <Route path="/guard_home" element={<GuardHome />} />
            <Route path="/existinglogs" element={<EntryLog />} />
          </Routes>
        </main>
      </div>
    );
  }


// HOMEOWNER
if (role === "homeowner") {
  return (
    <div className="bg-gray-900 min-h-screen text-white relative">
      <SidebarHomeowner />
        <main className="absolute top-0 left-0 right-0 min-h-screen pt-10 pr-4 pl-16 md:pl-64 bg-[#0e1525] text-white overflow-x-auto transition-all duration-300">


        <Routes>
          <Route path="/" element={<Navigate to="/homeowner_home" />} />
          <Route path="/homeowner_home" element={<HomeownerHome />} />
          <Route path="/homeowner/borrow_item" element={<BorrowItem />} />
          <Route path="/homeowner/borrow_amenities" element={<BorrowAmenities />} />
          <Route path="/homeowner/register_vehicle" element={<RegisterVehicle />} />
          <Route path="/homeowner/manage_vehicles" element={<ManageVehicles />} />
          <Route path="/homeowner/submit_report" element={<SubmitReport />} />
          <Route path="/homeowner/request_entry" element={<EntryLogRequest />} />
          <Route path="/homeowner/visitor_logs" element={<VisitorLogHistory />} />
          <Route path="/homeowner/announcements" element={<HomeownerAnnouncements />} />
          <Route path="/homeowner/dues" element={<HomeownerDues />} />
          <Route path="/items/view" element={<ItemsView />} />
          <Route path="/amenities/view" element={<AmenityView />} />
        </Routes>
      </main>
    </div>
  );
}

  

  // Default fallback
  return <Navigate to="/login" />;
}
