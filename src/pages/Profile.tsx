import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const defaultProfile = {
  profilePic: "",
  linkedin: "",
  instagram: "",
  facebook: "",
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem("userProfile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [preview, setPreview] = useState(profile.profilePic);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string);
        setProfile((prev: any) => ({ ...prev, profilePic: ev.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify({ ...profile, profilePic: preview }));
    alert("Profile saved!");
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-10 bg-gradient-to-br from-blue-600 via-cyan-400 to-pink-300">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl p-0 border border-border overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-center px-8 py-6 bg-gradient-to-r from-blue-700 to-pink-400">
          <h2 className="text-3xl font-extrabold text-white drop-shadow tracking-tight">My Profile</h2>
        </div>
        <div className="flex flex-col items-center mb-8 pt-8">
          <div className="relative w-36 h-36 mb-2">
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-pink-400 p-1"></span>
            <img
              src={preview || "https://ui-avatars.com/api/?name=User"}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-white shadow relative z-10"
            />
            <Button
              type="button"
              className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-pink-400 text-white rounded-full p-2 shadow-lg hover:scale-105 transition z-20"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="space-y-5 px-8 pb-8">
          <div>
            <label className="block font-semibold mb-1 text-blue-900" htmlFor="linkedin">
              LinkedIn
            </label>
            <input
              id="linkedin"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition bg-blue-50/50"
              value={profile.linkedin}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-pink-700" htmlFor="instagram">
              Instagram
            </label>
            <input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="https://instagram.com/yourprofile"
              className="w-full border border-pink-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-300 transition bg-pink-50/50"
              value={profile.instagram}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-700" htmlFor="facebook">
              Facebook
            </label>
            <input
              id="facebook"
              name="facebook"
              type="url"
              placeholder="https://facebook.com/yourprofile"
              className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition bg-blue-50/50"
              value={profile.facebook}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex gap-4 px-8 pb-8">
          <Button className="bg-gradient-to-r from-blue-600 to-pink-400 text-white flex-1 shadow-md hover:scale-105 transition" onClick={handleSave}>
            Save Profile
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={() => navigate("/")}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;