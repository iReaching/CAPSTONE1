import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e1525] text-white">
      <div className="bg-indigo-100 text-center px-10 py-16 rounded-lg shadow-md max-w-lg w-full">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">Welcome to VilMan</h1>
        <p className="text-sm text-gray-600 mb-6">
          VilMan is a comprehensive Homeowner Management System designed to streamline administrative tasks,
          enhance security, and improve communication between residents, staff, guards, and admins in residential communities.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition"
        >
          Proceed
        </button>
      </div>
    </div>
  );
}
