import React, { useState, useEffect } from "react";

export default function ProfileModal({ show, onClose }) {
  const [profile, setProfile] = useState({
    user_id: "",
    role: "",
    full_name: "",
    contact_number: "",
    profile_picture: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");

  // Fetch user profile on component mount
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetch(`http://localhost/test2/capstone1/php/get_profile.php?user_id=${userId}`)
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch((err) => console.error("Error fetching profile:", err));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("user_id", profile.user_id);
    formData.append("full_name", profile.full_name);
    formData.append("contact_number", profile.contact_number);
    if (profilePic) formData.append("profile_pic", profilePic);

    const response = await fetch("http://localhost/test2/capstone1/php/update_profile.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    if (result.success) {
      alert("Profile updated successfully!");
      onClose();
    } else {
      alert("Update failed.");
      console.error(result.error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-4">
            <div className="border border-dashed border-gray-300 rounded-lg p-4 w-full flex flex-col items-center">
                <img
                src={preview || profile.profile_picture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mb-3"
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

          {/* User ID (Read-only) */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={profile.user_id}
              readOnly
              className="w-full border px-3 py-2 rounded text-sm bg-gray-100 text-gray-600"
            />
          </div>

          {/* Role (Read-only) */}
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
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-sm text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              value={profile.contact_number}
              onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })}
              className="w-full border px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Save Button */}
          <div className="text-right pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
