// src/components/Header.jsx
import { LogOut, Bell } from "lucide-react";

export default function Header({ onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#4169B3]  shadow z-40 flex justify-end items-center px-4 md:pl-64 border-b border-gray-200">
      <div className="flex items-center gap-4 text-white">
        {/* Notifications icon */}
        <button
          className="relative p-2 hover:text-indigo-600"
          onClick={() => alert("Notifications clicked")}
        >
          <Bell size={20} />
          {/* Optional: notification dot */}
          <span className="absolute top-1.5 right-1.5 inline-block w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Logout button */}
        <button
          className="p-2 hover:text-red-600"
          onClick={onLogout}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
