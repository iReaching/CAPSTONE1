import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import {
  LogIn,
  User,
  Lock,
  Building2,
  Loader2
} from "lucide-react";
export default function Login(props) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("password", password);
  
    try {
      const response = await fetch(`${BASE_URL}login.php`, {
        method: "POST",
        body: formData,
        credentials: 'include',
      });
  
      const result = await response.json();
  
      if (result.success) {
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("role", result.role);
        localStorage.setItem("is_admin", result.is_admin);
      
        if (props.onLogin) props.onLogin(); // trigger re-render in App
      
        // redirect based on role
        const role = result.role;
        if (role === "admin") navigate("/home");
        else if (role === "staff") navigate("/staff_home");
        else if (role === "guard") navigate("/guard_home");
        else if (role === "homeowner") navigate("/homeowner_home");
        else navigate("/home");
      } else {
        setError(result.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("Error connecting to the server. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  

return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CondoLink</h1>
          <p className="text-gray-600">Welcome back to your community portal</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-black"
                placeholder="Enter your user ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-black"
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              Sign In
            </>
          )}
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">© 2025 CondoLink System. All rights reserved.</p>
        </div>
      </form>
    </div>
  </div>
);

}
