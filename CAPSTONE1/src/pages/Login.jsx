import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
      const response = await fetch("http://localhost/vitecap1/capstone1/php/login.php", {
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
    <div className="min-h-screen flex items-center justify-center bg-[#0e1525]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-bold text-center text-indigo-700 mb-6">VilMan Login</h2>

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">User ID</label>
          <input
            type="text"
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded text-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
