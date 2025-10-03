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
import AdminBalances from "./pages/AdminBalances";
import Amenities from "./pages/Amenities";
import Reports from "./pages/Reports";
import EntryLog from "./pages/EntryLog";
import Account from "./pages/Account";
import AmenityView from "./pages/amenitiesSUB/AmenityView";
import AmenityAdd from "./pages/amenitiesSUB/AmenityAdd";
import AmenityEdit from "./pages/amenitiesSUB/AmenityEdit";
import AmenitySchedules from "./pages/amenitiesSUB/AmenitySchedules";
import EntryLogRequest from "./pages/homeownerSUB/EntryLogRequest";
import SystemLogs from "./pages/SystemLogs";
import Header from './components/Header';
import Index from "./pages/Index";
import Login from "./pages/Login";
import HomeownerDues from "./pages/homeownerSUB/HomeownerDues";
import BorrowAmenities from "./pages/homeownerSUB/BorrowAmenities";
import RegisterVehicle from "./pages/homeownerSUB/RegisterVehicle";
import SubmitReport from "./pages/homeownerSUB/SubmitReport";
import VisitorLogHistory from "./pages/homeownerSUB/VisitorLogHistory";
import HomeownerAnnouncements from "./pages/homeownerSUB/HomeownerAnnouncements";
import ManageVehicles from './pages/homeownerSUB/ManageVehicles';
import Health from "./pages/Health";

import {
  Home as HomeIcon,
  CalendarDays,
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
        <Route path="/health" element={<Health />} />

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Rendered header with hamburger to open sidebar on mobile
  const renderHeader = () => (
    <Header
      onMenuClick={() => setSidebarOpen(true)}
      onLogout={() => {
        localStorage.clear();
        window.location.href = "/login";
      }}
    />
  );

  // ADMIN
  if (role === "admin") {
    return (
      <div className="bg-gray-900 min-h-screen text-white relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <SidebarItem icon={<HomeIcon size={30} />} text="Home" link="/home" />
          <SidebarItem icon={<CalendarDays size={30} />} text="Amenities" link="/amenities" />
          <SidebarItem icon={<FileText size={30} />} text="Report" link="/reports" />
          <SidebarItem icon={<ScrollText size={30} />} text="Entry Log" link="/entrylog" />
          <SidebarItem icon={<UserSquare size={30} />} text="Account" link="/account" />
          <SidebarItem icon={<Megaphone size={30} />} text="Announcement" link="/announcements" />
        </Sidebar>

        {renderHeader()}
        <main className="absolute top-0 left-0 right-0 min-h-screen pt-20 pr-4 pl-16 md:pl-64 bg-[#eef2ff] text-white overflow-x-auto transition-all duration-300">          
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/amenities/view" element={<AmenityView />} />
            <Route path="/amenities/add" element={<AmenityAdd />} />
            <Route path="/amenities/edit" element={<AmenityEdit />} />
            <Route path="/amenities/schedules" element={<AmenitySchedules />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/entrylog" element={<EntryLog />} />
            <Route path="/system_logs" element={<SystemLogs />} />
            <Route path="/account" element={<Account />} />
            <Route path="/announcement" element={<AdminAnnouncements />} />
            <Route path="/dues" element={<AdminDues />} />
            <Route path="/balances" element={<AdminBalances />} />
          </Routes>
        </main>
      </div>
    );
  }

  // STAFF
  if (role === "staff") {
    return (
      <div className="bg-gray-900 min-h-screen text-white relative">
        <SidebarStaff isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <SidebarItem icon={<HomeIcon size={30} />} text="Home" link="/staff_home" />
          <SidebarItem icon={<CalendarDays size={30} />} text="Amenities" link="/amenities" />
          <SidebarItem icon={<FileText size={30} />} text="Report" link="/reports" />
          <SidebarItem icon={<UserSquare size={30} />} text="Account" link="/account" />
        </SidebarStaff>
        {renderHeader()}
        <main className="absolute top-0 left-0 right-0 min-h-screen pt-16 pr-4 pl-16 md:pl-64 bg-[#eef2ff] text-white overflow-x-auto transition-all duration-300">          
          <Routes>
            <Route path="/" element={<Navigate to="/staff_home" />} />
            <Route path="/staff_home" element={<StaffHome />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/amenities/view" element={<AmenityView />} />
            <Route path="/amenities/add" element={<AmenityAdd />} />
            <Route path="/amenities/edit" element={<AmenityEdit />} />
            <Route path="/amenities/schedules" element={<AmenitySchedules />} />
            <Route path="/reports" element={<Reports />} />
            {/* Account route removed for Staff UI/UX */}
            <Route path="/dues" element={<AdminDues />} />
          </Routes>
        </main>
      </div>
    );
  }

  // GUARD
  if (role === "guard") {
    return (
      <div className="bg-gray-900 min-h-screen text-white relative">
        <SidebarGuard isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {renderHeader()}
        <main className="absolute top-0 left-0 right-0 min-h-screen pt-16 pr-4 pl-16 md:pl-64 bg-[#eef2ff] text-white overflow-x-auto transition-all duration-300">          
          <Routes>
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
      <SidebarHomeowner isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {renderHeader()}
        <main className="absolute top-0 left-0 right-0 min-h-screen pt-16 pr-4 pl-16 md:pl-64 bg-[#eef2ff] text-white overflow-x-auto transition-all duration-300">


        <Routes>
          <Route path="/" element={<Navigate to="/homeowner_home" />} />
          <Route path="/homeowner_home" element={<HomeownerHome />} />
          <Route path="/homeowner/submit_report" element={<SubmitReport />} />
          <Route path="/homeowner/visitor_logs" element={<VisitorLogHistory />} />
          <Route path="/homeowner/announcements" element={<HomeownerAnnouncements />} />
          <Route path="/homeowner/dues" element={<HomeownerDues />} />
          <Route path="/amenities/view" element={<AmenityView />} />
        </Routes>
      </main>
    </div>
  );
}

  

  // Default fallback
  return <Navigate to="/login" />;
}
