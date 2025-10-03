import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
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
  const [registerData, setRegisterData] = useState({ user_id: "", email: "", password: "", role: "homeowner", is_admin: 0, unit_id: "" });

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
          setRegisterData({ user_id: "", email: "", password: "", role: "homeowner", is_admin: 0, unit_id: "" });
          fetchUsers();
        } else {
          import("../lib/toast").then(({ showToast }) => showToast(data.message || "Failed to register.", 'error'));
        }
      })
      .catch(() => import("../lib/toast").then(({ showToast }) => showToast("Registration failed.", 'error')));
  };

  const handleDeleteAccount = () => {
    if (!details || !details.profile) return;
    if (!window.confirm("Are you sure you want to delete this account?")) return;
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
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Accounts</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowRegisterModal(true)} className="inline-flex items-center gap-2">
            <Plus size={16} /> Add Account
          </Button>
        </div>
      </div>
      <div className="mt-6">
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
            <TH>User</TH>
            <TH>Contact</TH>
            <TH>Role</TH>
            <TH>Unit</TH>
            <TH className="text-right">Action</TH>
          </TR>
        </THead>
        <TBody>
          {users.map((u) => (
            <TR key={u.user_id} className="hover:bg-gray-50">
              <TD>
                <div className="flex items-center gap-3">
                  <img
                    src={u.profile_pic?.startsWith("uploads/") ? assetUrl(u.profile_pic) : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.user_id || "User")}&background=111111&color=ffffff`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border"
                    onError={(e)=>{ e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.user_id || 'User')}&background=111111&color=ffffff`; }}
                  />
                  <div className="hidden sm:block">
                    <div className="font-medium text-gray-900 truncate max-w-[160px]">{u.full_name || u.user_id}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[160px]">{u.email}</div>
                  </div>
                </div>
              </TD>
              <TD className="sm:hidden">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{u.full_name || u.user_id}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </TD>
              <TD>{u.contact_number || '—'}</TD>
              <TD>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role==='admin'? 'bg-purple-100 text-purple-700' : u.role==='staff'? 'bg-blue-100 text-blue-700' : u.role==='guard'? 'bg-teal-100 text-teal-700' : 'bg-green-100 text-green-700'}`}>
                  {u.role || '—'}
                </span>
              </TD>
              <TD>{u.unit_id || '—'}</TD>
              <TD className="text-right">
                <Button onClick={() => handleView(u.user_id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">View</Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      {/* Modals */}
      <>
      {modalOpen && details && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-2xl shadow-xl w-[95vw] max-w-5xl relative overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={details.profile.profile_pic?.startsWith("uploads/") ? assetUrl(details.profile.profile_pic) : `https://ui-avatars.com/api/?name=${encodeURIComponent(details.profile.full_name || details.profile.user_id || 'User')}&background=111111&color=ffffff`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <div className="text-xl font-bold text-gray-900">{details.profile.full_name || details.profile.user_id}</div>
                  <div className="text-sm text-gray-600">{details.profile.email}</div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-gray-700">{details.profile.contact_number || 'No contact'}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-700">Unit: {details.profile.unit_id || '—'}</span>
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${details.profile.role==='admin'? 'bg-purple-100 text-purple-700' : details.profile.role==='staff'? 'bg-blue-100 text-blue-700' : details.profile.role==='guard'? 'bg-teal-100 text-teal-700' : 'bg-green-100 text-green-700'}`}>{details.profile.role}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setModalOpen(false); setDetails(null); }} className="px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50">Close</button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-3 py-1.5 rounded-lg border text-red-600 hover:bg-red-50"
                  title="Delete Account"
                >
                  <Trash2 size={20} /> Delete
                </button>
            </div>
            </div>
            {/* Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
              {/* Activity */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">Amenity Requests</div>
                    <div className="text-lg font-bold">{details.activity.amenity_requests}</div>
                  </div>
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">Item Requests</div>
                    <div className="text-lg font-bold">{details.activity.item_requests}</div>
                  </div>
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">Reports</div>
                    <div className="text-lg font-bold">{details.activity.reports}</div>
                  </div>
                  <div className="rounded-lg border p-3 bg-gray-50">
                    <div className="text-xs text-gray-500">Entry Log Requests</div>
                    <div className="text-lg font-bold">{details.activity.entry_logs}</div>
                  </div>
                </div>
              </div>

              {/* Vehicles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Registered Vehicles</h3>
                {details.vehicles.length === 0 ? (
                  <p className="text-sm text-gray-500">No registered vehicles found.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {details.vehicles.map((v, idx) => (
                      <div key={idx} className="border rounded-xl p-4 flex gap-3 items-start">
                        {v.vehicle_pic_path && (
                          <img src={assetUrl(v.vehicle_pic_path)} alt="Vehicle" className="w-24 h-16 object-cover rounded border" />
                        )}
                        <div className="text-sm text-gray-800">
                          <div className="font-medium">{v.name} <span className="text-gray-500">• {v.type}</span></div>
                          <div>Plate: {v.plate || '—'}</div>
                          <div>Color: {v.color || '—'}</div>
                          <div>Block/Lot: {v.block || '—'}/{v.lot || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

            {registerData.role === 'homeowner' && (
              <>
                <label className="block mb-2 text-sm">Unit ID</label>
                <Input type="text" name="unit_id" placeholder="e.g., Unit 101-A" value={registerData.unit_id} onChange={handleInputChange} className="mb-4" />
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowRegisterModal(false)}>Cancel</Button>
              <Button onClick={handleRegister}>Register</Button>
            </div>
          </div>
        </div>
      )}
      </>
      </div>
    </div>
  );
}
