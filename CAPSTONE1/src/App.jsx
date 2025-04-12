import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import Home from "./pages/Home";
import Amenities from "./pages/Amenities";
import Items from "./pages/Items";
import Reports from "./pages/Reports";
import EntryLog from "./pages/EntryLog";
import Account from "./pages/Account";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AmenityView from "./pages/amenitiesSUB/AmenityView";
import AmenityAdd from "./pages/amenitiesSUB/AmenityAdd";
import AmenityEdit from "./pages/amenitiesSUB/AmenityEdit";
import AmenitySchedules from "./pages/amenitiesSUB/AmenitySchedules";

import {
  Home as HomeIcon,
  CalendarDays,
  Boxes,
  FileText,
  ScrollText,
  UserSquare
} from "lucide-react";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

        {/* Protected layout wrapper */}
        <Route
          path="/*"
          element={
            localStorage.getItem("user_id") ? (
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
                    <Route path="/items" element={<Items />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/entrylog" element={<EntryLog />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/amenities/view" element={<AmenityView />} />
                    <Route path="/amenities/add" element={<AmenityAdd />} />
                    <Route path="/amenities/edit" element={<AmenityEdit />} />
                    <Route path="/amenities/schedules" element={<AmenitySchedules />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>
    </Router>
  );
}
