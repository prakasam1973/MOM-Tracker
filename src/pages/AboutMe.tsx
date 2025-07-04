import React from "react";

const AboutMe: React.FC = () => (
  <div className="flex flex-col items-center min-h-[80vh] py-10 bg-gradient-to-br from-blue-600 via-cyan-400 to-pink-300">
    <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-2xl p-0 border border-border overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-center px-8 py-6 bg-gradient-to-r from-blue-700 to-pink-400">
        <h2 className="text-3xl font-extrabold text-white drop-shadow tracking-tight">About Me</h2>
      </div>
      <div className="flex flex-col items-center pt-8 mb-6">
        <span className="relative w-32 h-32 mb-2">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-pink-400 p-1"></span>
          <img
            src={
              (() => {
                // Try to load profilePic from localStorage (set in Profile page)
                try {
                  const profile = JSON.parse(localStorage.getItem("userProfile") || "{}");
                  return profile.profilePic ||
                    "https://ui-avatars.com/api/?name=Prakasam+Sellappan";
                } catch {
                  return "https://ui-avatars.com/api/?name=Prakasam+Sellappan";
                }
              })()
            }
            alt="Prakasam Sellappan"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow relative z-10"
          />
        </span>
        <h3 className="text-xl font-bold text-blue-900 mb-1">Prakasam Sellappan</h3>
        <p className="text-pink-700 font-medium mb-2">Engineering Leader</p>
      </div>
      <div className="text-gray-700 text-lg leading-relaxed space-y-4 px-10">
        <p>
          Seasoned Engineering Leader with Extensive Experience in J2EE/.NET Enterprise Cloud Software Development and ISO/CMMi3 Quality Processes. Recognized Agile Scrum Expert with Proficiency in Managing Cross-Cultural Teams and Fostering Strong Organizational Cultures. Successfully Oversaw More Than 10 Simultaneous Product Developments, generating Over $100M in Annual Revenue. Demonstrated Expertise in Recruitment, Training, and Mentoring to Establish High-Performance Teams. Additionally, Actively Engaged in Corporate Social Responsibility, Ensuring Meaningful Impact on Communities and Environmental Sustainability. Trusted Advisor to Business Leadership on All CSR Matters.
        </p>
      </div>
      {/* LinkedIn and Email links removed */}
    </div>
  </div>
);

export default AboutMe;