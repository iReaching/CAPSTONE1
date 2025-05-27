import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ScrollText, Megaphone } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#eef2ff] flex flex-col items-center justify-center px-4">
      {/* Top Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-indigo-600">Welcome to CondoLink</h1>
        <p className="mt-4 text-gray-600 max-w-xl mx-auto">
          Your all-in-one Condominium Management System designed for efficiency, security, and community engagement.
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-12">
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
          <Home className="mx-auto text-indigo-500" size={36} />
          <h3 className="mt-3 text-lg font-semibold text-indigo-700">Amenities Booking</h3>
          <p className="text-sm text-gray-500 mt-1">Reserve clubhouses, pools, and courts with ease.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
          <ScrollText className="mx-auto text-indigo-500" size={36} />
          <h3 className="mt-3 text-lg font-semibold text-indigo-700">Entry Logging</h3>
          <p className="text-sm text-gray-500 mt-1">Monitor visitor entries and log security events seamlessly.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
          <Megaphone className="mx-auto text-indigo-500" size={36} />
          <h3 className="mt-3 text-lg font-semibold text-indigo-700">Community Announcements</h3>
          <p className="text-sm text-gray-500 mt-1">Stay informed about dues, updates, and urgent alerts.</p>
        </div>
      </div>

      {/* Call to Action */}
      <button
        onClick={() => navigate("/login")}
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
      >
        Proceed to Login
      </button>

      {/* Footer Illustration Placeholder */}
      <div className="mt-16">
        <img
          src="https://img.icons8.com/?size=100&id=73&format=png&color=000000"
          alt="Community graphic"
          className="max-h-72 w-auto object-contain opacity-80"
        />
      </div>
    </div>
  );
}
