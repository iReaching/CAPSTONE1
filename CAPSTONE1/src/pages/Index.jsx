// src/pages/Index.jsx
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center text-center p-10">
      <h1 className="text-5xl font-bold text-indigo-800 mb-4">Welcome to VilMan</h1>
      <p className="text-gray-700 max-w-xl mb-8">
        VilMan is a comprehensive Homeowner Management System designed to streamline administrative
        tasks, enhance security, and improve communication between residents, staff, guards, and admins
        in residential communities.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
      >
        Proceed
      </button>
    </div>
  );
}
