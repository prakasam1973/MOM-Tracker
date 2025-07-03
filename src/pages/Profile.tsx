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
    <div className="flex flex-col items-center min-h-[80vh] py-10">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-xl p-8 border border-border">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-primary tracking-tight">My Profile</h2>
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-36 h-36 mb-2">
            <img
              src={preview || "https://ui-avatars.com/api/?name=User"}
              alt="Profile"
              className="w-36 h-36 rounded-full object-cover border-4 border-blue-200 shadow"
            />
            <Button
              type="button"
              className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-600 to-cyan-400 text-white rounded-full p-2 shadow-lg hover:scale-105 transition"
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
        <div className="space-y-5">
          <div>
            <label className="block font-semibold mb-1 text-blue-900" htmlFor="linkedin">
              LinkedIn
            </label>
            <input
              id="linkedin"
              name="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-300 transition"
              value={profile.linkedin}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900" htmlFor="instagram">
              Instagram
            </label>
            <input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="https://instagram.com/yourprofile"
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-300 transition"
              value={profile.instagram}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-blue-900" htmlFor="facebook">
              Facebook
            </label>
            <input
              id="facebook"
              name="facebook"
              type="url"
              placeholder="https://facebook.com/yourprofile"
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition"
              value={profile.facebook}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <Button className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white flex-1 shadow-md hover:scale-105 transition" onClick={handleSave}>
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