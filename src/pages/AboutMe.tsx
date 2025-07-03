import React from "react";

const AboutMe: React.FC = () => (
  <div className="flex flex-col items-center min-h-[80vh] py-10">
    <div className="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-10 border border-border">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-primary tracking-tight">About Me</h2>
      <div className="flex flex-col items-center mb-6">
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
          className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow mb-4"
        />
        <h3 className="text-xl font-bold text-blue-900 mb-1">Prakasam Sellappan</h3>
        <p className="text-blue-700 font-medium mb-2">Engineering Leader</p>
      </div>
      <div className="text-gray-700 text-lg leading-relaxed space-y-4">
        <p>
          Seasoned Engineering Leader with Extensive Experience in J2EE/.NET Enterprise Cloud Software Development and ISO/CMMi3 Quality Processes. Recognized Agile Scrum Expert with Proficiency in Managing Cross-Cultural Teams and Fostering Strong Organizational Cultures. Successfully Oversaw More Than 10 Simultaneous Product Developments, generating Over $100M in Annual Revenue. Demonstrated Expertise in Recruitment, Training, and Mentoring to Establish High-Performance Teams. Additionally, Actively Engaged in Corporate Social Responsibility, Ensuring Meaningful Impact on Communities and Environmental Sustainability. Trusted Advisor to Business Leadership on All CSR Matters.
        </p>
      </div>
      <div className="mt-8 flex justify-center gap-6">
        <a
          href="https://www.linkedin.com/in/prakasams/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-semibold underline"
        >
          LinkedIn
        </a>
        <a
          href="mailto:prakasam.s@gmail.com"
          className="text-blue-600 hover:text-blue-800 font-semibold underline"
        >
          Email
        </a>
      </div>
    </div>
  </div>
);

export default AboutMe;