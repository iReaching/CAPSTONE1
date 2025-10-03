import React, { useState, useEffect } from "react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
export default function ProfileModal({ show, onClose, onProfileUpdate }) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'vehicle'
  const [profile, setProfile] = useState({
    user_id: "",
    role: "",
    full_name: "",
    contact_number: "",
    profile_picture: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");

  // Vehicle state (one vehicle per tenant)
  const [vehicle, setVehicle] = useState(null); // {id, name, color, type, plate}
  const [vehicleForm, setVehicleForm] = useState({ name: "", color: "", vehicle_type: "", vehicle_plate: "" });
  const [vehicleEditing, setVehicleEditing] = useState(false);

  // Transition in/out
  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      setTimeout(() => setVisible(false), 200); // optional: wait for fade-out
    }
  }, [show]);

  // Load profile + vehicle data
  useEffect(() => {
    if (!show) return;
    const userId = localStorage.getItem("user_id");
    
    if (userId) {
      // Profile
      fetch(`${BASE_URL}get_profile.php?user_id=${userId}`, { credentials: 'include' })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setProfile(data);
            setPreview(data.profile_picture || "");
          } catch (parseError) {
            console.error('ProfileModal - Failed to parse JSON:', parseError);
          }
        })
        .catch((err) => console.error("Error fetching profile:", err));

      // Vehicle
      fetch(`${BASE_URL}get_user_details.php?user_id=${userId}`, { credentials: 'include' })
        .then(res => res.json())
        .then((data) => {
          const v = Array.isArray(data?.vehicles) && data.vehicles.length > 0 ? data.vehicles[0] : null;
          setVehicle(v);
          if (v) {
            setVehicleForm({
              name: v.name || "",
              color: v.color || "",
              vehicle_type: v.type || "",
              vehicle_plate: v.plate || "",
            });
          }
        })
        .catch((err) => console.error('Vehicle fetch error:', err));
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("user_id", profile.user_id);
    formData.append("full_name", profile.full_name);
    formData.append("contact_number", profile.contact_number);
    if (profilePic) formData.append("profile_pic", profilePic);

const response = await fetch(`${BASE_URL}update_profile.php`, {
      method: "POST",
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();
    if (result.success) {
      import("../lib/toast").then(({ showToast }) => showToast("Profile updated successfully!"));
      if (typeof onProfileUpdate === "function") onProfileUpdate();
      onClose();
    } else {
      import("../lib/toast").then(({ showToast }) => showToast("Update failed.", 'error'));
      console.error(result.error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

    const formData = new FormData();
    formData.append("user_id", profile.user_id);

const res = await fetch(`${BASE_URL}delete_account.php`, {
      method: "POST",
      body: formData,
      credentials: 'include',
    });

    const result = await res.json();
    if (result.success) {
      import("../lib/toast").then(({ showToast }) => showToast("Account deleted."));
      localStorage.clear();
      window.location.href = "/login";
    } else {
      import("../lib/toast").then(({ showToast }) => showToast("Failed to delete account.", 'error'));
      console.error(result.error);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      } bg-black/50 backdrop-blur-sm`}
    >
      <div
className={`bg-white rounded-lg shadow-lg w-full max-w-md md:max-w-lg lg:max-w-xl p-0 relative transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold text-center text-gray-800">Profile</h2>
          {/* Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              className={`py-2 rounded-md text-sm font-medium ${activeTab==='profile' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={()=> setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-2 rounded-md text-sm font-medium ${activeTab==='vehicle' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={()=> setActiveTab('vehicle')}
            >
              Vehicle
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="px-6 pb-6 max-h-[80vh] overflow-y-auto">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-4">
                <div className="border border-dashed border-gray-300 rounded-lg p-4 w-full flex flex-col items-center">
                  <img
                    src={
                      preview 
                        ? (preview.startsWith('http') || preview.startsWith('blob:') 
                            ? preview 
                            : assetUrl(preview))
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.user_id || 'User')}&background=4169B3&color=ffffff`
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover mb-3"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.user_id || 'User')}&background=4169B3&color=ffffff`;
                    }}
                  />
                  <label className="text-sm text-indigo-600 font-medium cursor-pointer">
                    Change Profile Picture
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setProfilePic(e.target.files[0]);
                        setPreview(URL.createObjectURL(e.target.files[0]));
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* User ID */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">User ID</label>
                <input
                  type="text"
                  value={profile.user_id}
                  readOnly
                  className="w-full border px-3 py-2 rounded text-sm bg-gray-100 text-gray-600"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={profile.role}
                  readOnly
                  className="w-full border px-3 py-2 rounded text-sm bg-gray-100 text-gray-600"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  className="w-full border border-black px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  value={profile.contact_number || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, contact_number: e.target.value }))
                  }
                  className="w-full border border-black px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-600"
                />
              </div>

              {/* Button Row */}
              <div className="pt-4 space-y-3">
                {/* Save Changes - Primary action */}
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
                
                {/* Secondary actions */}
                <div className="flex justify-between items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'vehicle' && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-800">Vehicle</h3>
                {!vehicle && (
                  <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">Only 1 vehicle per tenant is allowed</span>
                )}
              </div>

              {vehicle ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-700"><span className="font-medium">Plate:</span> {vehicle.plate}</div>
                  <div className="text-sm text-gray-700"><span className="font-medium">Type:</span> {vehicle.type || '—'}</div>
                  <div className="text-sm text-gray-700"><span className="font-medium">Name:</span> {vehicle.name || '—'}</div>
                  <div className="text-sm text-gray-700"><span className="font-medium">Color:</span> {vehicle.color || '—'}</div>

                  <button type="button" onClick={() => setVehicleEditing((v) => !v)} className="mt-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm">{vehicleEditing ? 'Cancel Edit' : 'Edit Vehicle'}</button>

                  {vehicleEditing && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Name" value={vehicleForm.name} onChange={(e)=>setVehicleForm({...vehicleForm,name:e.target.value})} />
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Color" value={vehicleForm.color} onChange={(e)=>setVehicleForm({...vehicleForm,color:e.target.value})} />
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Type (e.g., Sedan)" value={vehicleForm.vehicle_type} onChange={(e)=>setVehicleForm({...vehicleForm,vehicle_type:e.target.value})} />
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Plate Number" value={vehicleForm.vehicle_plate} onChange={(e)=>setVehicleForm({...vehicleForm,vehicle_plate:e.target.value})} />
                      <button type="button" className="col-span-1 sm:col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm" onClick={async ()=>{
                        try {
                          const fd = new FormData();
                          fd.append('id', vehicle.id);
                          fd.append('vehicle_type', vehicleForm.vehicle_type);
                          fd.append('vehicle_plate', vehicleForm.vehicle_plate);
                          fd.append('vehicle_name', vehicleForm.name);
                          fd.append('vehicle_color', vehicleForm.color);
                          const res = await fetch(`${BASE_URL}update_vehicle.php`, { method:'POST', body: fd, credentials:'include' });
                          const data = await res.json();
                          if (data.success) {
                            import("../lib/toast").then(({ showToast }) => showToast("Vehicle updated"));
                            setVehicle({ ...vehicle, type: vehicleForm.vehicle_type, plate: vehicleForm.vehicle_plate, name: vehicleForm.name, color: vehicleForm.color });
                            setVehicleEditing(false);
                          } else {
                            import("../lib/toast").then(({ showToast }) => showToast("Failed to update vehicle", 'error'));
                          }
                        } catch(e){ console.error(e); }
                      }}>Save Vehicle</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">Chateau Valenzuela Condominium accepts only 1 vehicle per tenant.</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input className="border rounded px-2 py-1 text-sm" placeholder="Name" value={vehicleForm.name} onChange={(e)=>setVehicleForm({...vehicleForm,name:e.target.value})} />
                    <input className="border rounded px-2 py-1 text-sm" placeholder="Color" value={vehicleForm.color} onChange={(e)=>setVehicleForm({...vehicleForm,color:e.target.value})} />
                    <input className="border rounded px-2 py-1 text-sm" placeholder="Type (e.g., Sedan)" value={vehicleForm.vehicle_type} onChange={(e)=>setVehicleForm({...vehicleForm,vehicle_type:e.target.value})} />
                    <input className="border rounded px-2 py-1 text-sm" placeholder="Plate Number" value={vehicleForm.vehicle_plate} onChange={(e)=>setVehicleForm({...vehicleForm,vehicle_plate:e.target.value})} />
                    <input className="border rounded px-2 py-1 text-sm" placeholder="Block" value={vehicleForm.block || ''} onChange={(e)=>setVehicleForm({...vehicleForm,block:e.target.value})} />
                    <input className="border rounded px-2 py-1 text-sm" placeholder="Lot" value={vehicleForm.lot || ''} onChange={(e)=>setVehicleForm({...vehicleForm,lot:e.target.value})} />
                  </div>
                  <button type="button" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-sm" onClick={async ()=>{
                    try {
                      const fd = new FormData();
                      fd.append('vehicle_name', vehicleForm.name);
                      fd.append('vehicle_color', vehicleForm.color);
                      fd.append('vehicle_type', vehicleForm.vehicle_type);
                      fd.append('vehicle_plate', vehicleForm.vehicle_plate);
                      fd.append('block', vehicleForm.block || '');
                      fd.append('lot', vehicleForm.lot || '');
                      const res = await fetch(`${BASE_URL}quick_register_vehicle.php`, { method:'POST', body: fd, credentials:'include' });
                      const data = await res.json();
                      if (data.success) {
                        import("../lib/toast").then(({ showToast }) => showToast("Vehicle added"));
                        setVehicle({ id: data.id, name: vehicleForm.name, color: vehicleForm.color, type: vehicleForm.vehicle_type, plate: vehicleForm.vehicle_plate });
                      } else {
                        import("../lib/toast").then(({ showToast }) => showToast(data.message || "Failed", 'error'));
                      }
                    } catch (e) { console.error(e); }
                  }}>Add Vehicle</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
