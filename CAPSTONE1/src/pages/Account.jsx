import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
import Page from "../components/ui/Page";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Table, { THead, TR, TH, TBody, TD } from "../components/ui/Table";

export default function Accounts() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({ user_id: "", email: "", password: "", role: "homeowner", is_admin: 0 });

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = () => {
    const params = new URLSearchParams({ search, role: roleFilter });
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
          import("../lib/toast").then(({ showToast }) => showToast("No profile found for this user.", 'error'));
        }
      })
      .catch((err) => {
        console.error("Error fetching user details:", err);
        import("../lib/toast").then(({ showToast }) => showToast("Failed to fetch user details.", 'error'));
      });
  };

  const handleRegister = () => {
    const payload = new FormData();
    Object.entries(registerData).forEach(([key, value]) => payload.append(key, value));

    fetch(`${BASE_URL}register_user.php`, { method: "POST", body: payload })
      .then((res) => res.json())
      .then((data) => {
          if (data.success) {
          import("../lib/toast").then(({ showToast }) => showToast("Account registered!"));
          setShowRegisterModal(false);
          setRegisterData({ user_id: "", email: "", password: "", role: "homeowner", is_admin: 0 });
          fetchUsers();
        } else {
          import("../lib/toast").then(({ showToast }) => showToast(data.message || "Failed to register.", 'error'));
        }
      })
      .catch(() => import("../lib/toast").then(({ showToast }) => showToast("Registration failed.", 'error')));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }));
  };

  return (
    <Page
      title="User Accounts"
      actions={
        <Button onClick={() => setShowRegisterModal(true)} className="inline-flex items-center gap-2">
          <Plus size={16} /> Add Account
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-md"
        />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full md:w-auto">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="guard">Guard</option>
          <option value="homeowner">Homeowner</option>
        </Select>
      </div>

      {/* User Table */}
      <Table>
        <THead>
          <TR>
            <TH>Profile</TH>
            <TH>Full Name</TH>
            <TH>Email</TH>
            <TH>Contact</TH>
            <TH>Role</TH>
            <TH className="text-right">Action</TH>
          </TR>
        </THead>
        <TBody>
          {users.map((u) => (
            <TR key={u.user_id}>
              <TD>
                <img
                  src={u.profile_pic?.startsWith("uploads/") ? assetUrl(u.profile_pic) : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || "")}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </TD>
              <TD>{u.full_name}</TD>
              <TD>{u.email}</TD>
              <TD>{u.contact_number}</TD>
              <TD className="capitalize">{u.role}</TD>
              <TD className="text-right">
                <Button variant="secondary" size="sm" onClick={() => handleView(u.user_id)}>View</Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      {/* Details Modal */}
      {modalOpen && details && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-lg max-w-5xl w-full shadow-lg relative flex flex-col md:flex-row gap-6 overflow-y-auto max-h-[90vh]">
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
                      import("../lib/toast").then(({ showToast }) => showToast("Account deleted successfully."));
                      setModalOpen(false);
                      fetchUsers();
                    } else {
                      import("../lib/toast").then(({ showToast }) => showToast("Failed to delete account.", 'error'));
                    }
                    })
                    .catch((err) => {
                      console.error("Error deleting account:", err);
                      import("../lib/toast").then(({ showToast }) => showToast("Error deleting account.", 'error'));
                    });
                }
              }}
              className="absolute top-2 left-2 p-2 bg-white text-red-600 rounded"
              title="Delete Account"
            >
              <Trash2 size={20} />
            </button>

            <button onClick={() => { setModalOpen(false); setDetails(null); }} className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl">
              &times;
            </button>

            {/* Left Column: User Info + Activity */}
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-bold">User Details</h3>
              <img
                src={details.profile.profile_pic?.startsWith("uploads/") ? assetUrl(details.profile.profile_pic) : `https://ui-avatars.com/api/?name=${encodeURIComponent(details.profile.full_name || "")}`}
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
                    <div key={idx} className="border rounded-lg shadow-md p-4 flex flex-col items-center bg-white text-black">
                      {v.vehicle_pic_path && (
                        <img src={assetUrl(v.vehicle_pic_path)} alt="Vehicle" className="w-60 h-auto object-contain mb-4 rounded border" />
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

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg text-black relative">
            <h2 className="text-xl font-bold mb-4">Register New Account</h2>

            <label className="block mb-2 text-sm">User ID</label>
            <Input type="text" name="user_id" value={registerData.user_id} onChange={handleInputChange} className="mb-4" />

            <label className="block mb-2 text-sm">Email</label>
            <Input type="email" name="email" value={registerData.email} onChange={handleInputChange} className="mb-4" />

            <label className="block mb-2 text-sm">Password</label>
            <Input type="password" name="password" value={registerData.password} onChange={handleInputChange} className="mb-4" />

            <label className="block mb-2 text-sm">Role</label>
            <Select name="role" value={registerData.role} onChange={handleInputChange} className="mb-4">
              <option value="staff">Staff</option>
              <option value="guard">Guard</option>
              <option value="homeowner">Homeowner</option>
            </Select>

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
              <Button onClick={handleRegister}>Register</Button>
            </div>
          </div>
        </div>
      )}
    </Page>
  );
}
