import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
export default function Login(props) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("password", password);
  
    try {
      const response = await fetch(`${BASE_URL}login.php`, {
        method: "POST",
        body: formData,
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
      }
       else {
        alert(result.message || "Login failed.");
      }
    } catch (err) {
      alert("Error connecting to the server.");
      console.error(err);
    }
  };
  

return (
  <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center"
    >
      {/* Optional Logo */}
      <div className="flex justify-center mb-4">
        {/* <img src="/vilman-icon.png" alt="Logo" className="w-12 h-12" /> */}
      </div>

      <h2 className="text-2xl font-bold text-indigo-700 mb-1">CondoLink Login Page</h2>
      <p className="text-sm text-gray-500 mb-6">Access your dashboard</p>

      <div className="text-left mb-4">
        <label className="block text-sm text-gray-700 mb-1">User ID</label>
        <input
          type="text"
          required
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="text-left mb-6">
        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition duration-200"
      >
        Login
      </button>

      <p className="text-xs text-gray-400 mt-6">© 2025 CondoLink System</p>
    </form>
  </div>
);

}
