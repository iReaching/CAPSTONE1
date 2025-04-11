import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {

    
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
  
    try {
      const response = await fetch("http://localhost/vitecap1/Capstone1/PHP/login.php", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
      console.log("Login response:", result);  // Add this line to see the full result in console.
  
      if (result.success) {
        localStorage.setItem("user_id", result.user_id);
        localStorage.setItem("role", result.role);
        localStorage.setItem("is_admin", result.is_admin);
  
        // Redirect based on role
        console.log("Redirecting to /home");
        if (result.role === "admin") navigate("/home");
        else if (result.role === "staff") navigate("/home");
        else if (result.role === "guard") navigate("/home");
        else if (result.role === "homeowner") navigate("/home");
        else alert("Unknown role.");
      } else {
        alert(result.message || "Login failed.");
      }
    } catch (error) {
      alert("Error connecting to the server.");
      console.error("Login error:", error);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">VilMan Login</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-black"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
