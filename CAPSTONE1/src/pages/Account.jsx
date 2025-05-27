import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Trash2 } from "lucide-react";
import { BASE_URL } from "../config";
export default function Accounts() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({
    user_id: "",
    email: "",
    password: "",
    role: "homeowner",
    is_admin: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = () => {
    const params = new URLSearchParams({
      search,
      role: roleFilter,
    });

    fetch(`${BASE_URL}get_users.php?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setUsers(data));
  };

  const handleView = (userId) => {
    fetch(`${BASE_URL}get_user_details.php?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile) {
          setDetails(data);
          setSelectedUser(data.profile);
          setModalOpen(true);
        } else {
          alert("No profile found for this user.");
        }
      })
      .catch(err => {
        console.error("Error fetching user details:", err);
        alert("Failed to fetch user details.");
      });
  };
  
  
  const handleRegister = () => {
    const payload = new FormData();
    Object.entries(registerData).forEach(([key, value]) =>
      payload.append(key, value)
    );

    fetch(`${BASE_URL}register_user.php`, {
      method: "POST",
      body: payload,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Account registered!");
          setShowRegisterModal(false);
          setRegisterData({ user_id: "", email: "", password: "", role: "homeowner", is_admin: 0 });
          fetchUsers(); // Refresh user list
        } else {
          alert(data.message || "Failed to register.");
        }
      })
      .catch(() => alert("Registration failed."));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };
  

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">User Accounts</h2>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-400 rounded w-full md:max-w-md text-white"
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-400 rounded text-gray-400"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="guard">Guard</option>
          <option value="homeowner">Homeowner</option>
        </select>

      <div className="flex">
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>
    </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left bg-white text-black rounded shadow">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2">Profile</th>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-b">
                <td className="px-4 py-2">
                  <img
                    src={
                      u.profile_pic?.startsWith("uploads/")
                        ? `${window.location.origin}/capstone1/${u.profile_pic}`
                        : "https://ui-avatars.com/api/?name=" + (u.full_name || "")
                    }
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="px-4 py-2">{u.full_name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.contact_number}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleView(u.user_id)}
                    className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 text-sm"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && details && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white text-black p-6 rounded-lg max-w-5xl w-full shadow-lg relative flex flex-col md:flex-row gap-6 overflow-y-auto max-h-[90vh]">

            {/* Delete Icon - Top Left */}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this account?")) {
                  fetch(`${BASE_URL}delete_account.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ user_id: details.profile.user_id }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success) {
                        alert("Account deleted successfully.");
                        setModalOpen(false);
                        fetchUsers();
                      } else {
                        alert("Failed to delete account.");
                      }
                    })
                    .catch((err) => {
                      console.error("Error deleting account:", err);
                      alert("Error deleting account.");
                    });
                }
              }}
              className="absolute top-2 left-2 p-2 bg-white text-red-600 rounded transition"
              title="Delete Account"
            >
              <Trash2 size={24} />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                setModalOpen(false);
                setDetails(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            {/* Left Column: User Info + Activity */}
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <img
                src={
                  details.profile.profile_pic?.startsWith("uploads/")
                    ? `${window.location.origin}/capstone1/${details.profile.profile_pic}`
                    : "https://ui-avatars.com/api/?name=" + (details.profile.full_name || "")
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
              />
              <p><strong>Full Name:</strong> {details.profile.full_name}</p>
              <p><strong>Email:</strong> {details.profile.email}</p>
              <p><strong>Contact:</strong> {details.profile.contact_number}</p>
              <p><strong>Role:</strong> {details.profile.role}</p>

              <div className="mt-6">
                <h4 className="text-lg font-semibold">Activity History</h4>
                <ul className="text-sm mt-2">
                  <li>{details.activity.amenity_requests} amenity request(s)</li>
                  <li>{details.activity.item_requests} item request(s)</li>
                  <li>{details.activity.reports} report(s)</li>
                  <li>{details.activity.entry_logs} entry log request(s)</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Registered Vehicles */}
            <div className="flex-1">
              <h4 className="text-xl font-bold mb-4 text-center">Registered Vehicles</h4>
              {details.vehicles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">No registered vehicles found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {details.vehicles.map((v, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg shadow-md p-4 flex flex-col items-center bg-white text-black"
                    >
                      {v.vehicle_pic_path && (
                        <img
                          src={`${window.location.origin}/capstone1/${v.vehicle_pic_path}`}
                          alt="Vehicle"
                          className="w-60 h-auto object-contain mb-4 rounded border"
                        />
                      )}
                      <div className="text-center space-y-1 text-sm">
                        <p><span className="font-semibold">Name:</span> {v.name}</p>
                        <p><span className="font-semibold">Type:</span> {v.type}</p>
                        <p><span className="font-semibold">Color:</span> {v.color}</p>
                        <p><span className="font-semibold">Plate:</span> {v.plate}</p>
                        <p><span className="font-semibold">Block:</span> {v.block}</p>
                        <p><span className="font-semibold">Lot:</span> {v.lot}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg text-black relative">
            <h2 className="text-xl font-bold mb-4">Register New Account</h2>

            <label className="block mb-2 text-sm">User ID</label>
            <input type="text" name="user_id" value={registerData.user_id} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded" />

            <label className="block mb-2 text-sm">Email</label>
            <input type="email" name="email" value={registerData.email} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded" />

            <label className="block mb-2 text-sm">Password</label>
            <input type="password" name="password" value={registerData.password} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded" />

            <label className="block mb-2 text-sm">Role</label>
            <select name="role" value={registerData.role} onChange={handleInputChange} className="w-full mb-4 p-2 border rounded">
              <option value="staff">Staff</option>
              <option value="guard">Guard</option>
              <option value="homeowner">Homeowner</option>
            </select>


            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRegisterModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              <button onClick={handleRegister} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Register</button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
