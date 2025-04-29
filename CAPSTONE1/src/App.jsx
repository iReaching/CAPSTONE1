import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import SidebarStaff from "./components/SidebarStaff";
// import SidebarGuard from "./components/SidebarGuard";
// import SidebarHomeowner from "./components/SidebarHomeowner";

import Home from "./pages/Home";
import StaffHome from "./pages/StaffHome";
// import GuardHome from "./pages/GuardHome";
// import HomeownerHome from "./pages/HomeownerHome";

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

import Index from "./pages/Index";
import Login from "./pages/Login";

import {
  Home as HomeIcon,
  CalendarDays,
  Boxes,
  FileText,
  ScrollText,
  UserSquare
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
        </Sidebar>

        <main className="absolute top-0 left-0 right-0 min-h-screen pl-64 pt-10 pr-10 bg-[#0e1525] text-white overflow-x-hidden">
          <Routes>
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
            <Route path="/account" element={<Account />} />
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

        <main className="absolute top-0 left-0 right-0 min-h-screen pl-64 pt-10 pr-10 bg-[#0e1525] text-white overflow-x-hidden">
          <Routes>
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
  // if (role === "guard") {
  //   return (
  //     <div className="bg-gray-900 min-h-screen text-white relative">
  //       <SidebarGuard>{/* Guard links here */}</SidebarGuard>
  //       <main className="absolute top-0 left-0 right-0 min-h-screen pl-64 pt-10 pr-10 bg-[#0e1525] text-white overflow-x-hidden">
  //         <Routes>
  //           <Route path="/" element={<Navigate to="/guard_home" />} />
  //           <Route path="/guard_home" element={<GuardHome />} />
  //         </Routes>
  //       </main>
  //     </div>
  //   );
  // }

  // HOMEOWNER
  // if (role === "homeowner") {
  //   return (
  //     <div className="bg-gray-900 min-h-screen text-white relative">
  //       <SidebarHomeowner>{/* Homeowner links here */}</SidebarHomeowner>
  //       <main className="absolute top-0 left-0 right-0 min-h-screen pl-64 pt-10 pr-10 bg-[#0e1525] text-white overflow-x-hidden">
  //         <Routes>
  //           <Route path="/" element={<Navigate to="/homeowner_home" />} />
  //           <Route path="/homeowner_home" element={<HomeownerHome />} />
  //         </Routes>
  //       </main>
  //     </div>
  //   );
  // }

  // Default fallback
  return <Navigate to="/login" />;
}
