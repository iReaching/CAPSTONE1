import React, { useState, useEffect } from "react";
import { BASE_URL } from "../config";
import { assetUrl } from "../lib/asset";
export default function ProfileModal({ show, onClose, onProfileUpdate }) {
  const [visible, setVisible] = useState(false);
  const [profile, setProfile] = useState({
    user_id: "",
    role: "",
    full_name: "",
    contact_number: "",
    profile_picture: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");

  // Transition in/out
  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      setTimeout(() => setVisible(false), 200); // optional: wait for fade-out
    }
  }, [show]);

  // Load profile data
  useEffect(() => {
    if (!show) return;
    const userId = localStorage.getItem("user_id");
    
    if (userId) {
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
        show ? "bg-black bg-opacity-40 opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative transform transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>
    </div>
  );
}
