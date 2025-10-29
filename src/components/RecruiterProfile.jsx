// React and Firebase imports
import { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../server/db-config/firebaseConfig";

// Styling and layout components
import "../css/RecruiterProfile.css";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { AuthContext } from "../context/AuthContext";

const RecruiterProfile = () => {
  // Local state to hold recruiter profile and loading status
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Access authenticated user and loading state
  const { user, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch recruiter profile from Firebase
    const fetchProfile = async () => {
      if (authLoading) return; // wait until auth state is resolved

      if (!user) navigate("/login"); // redirect if not authenticated

      const profileRef = doc(db, "recruiters", user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setProfile(profileSnap.data()); // update local state
      }
    };

    fetchProfile(); // trigger fetch on mount
    setIsLoading(false); // stop showing loader
  }, [authLoading, user]); // re-run when authLoading or user changes

  // Show loader until profile is fetched
  if (!profile) return <div className="loader-wrapper"><Loader /></div>;

  return (
    <>
      {/* Recruiter-specific navigation bar */}
      <Navbar role="recruiter" />

      {/* Profile layout */}
      <div className="profile-wrapper">
        <div className="profile-card">
          {/* Left section: personal info */}
          <div className="profile-left">
            <img src={profile.photoURL || "/src/assets/836.jpg"} alt="Profile" />
            <h2>{profile.fullName}</h2>
            <p className="role-label">Recruiter</p>
            <p><strong>📧</strong> {profile.email}</p>
            <p><strong>📞</strong> {profile.mobile}</p>
          </div>

          {/* Right section: company info */}
          <div className="profile-right">
            <h3>Company Info</h3>
            <p><strong>🏢 Name:</strong> {profile.companyName}</p>
            <p><strong>📍 Location:</strong> {profile.companyLocation}</p>
            <p><strong>🌐 Website:</strong> <a href={profile.website}>{profile.website}</a></p>

            {/* Edit profile button */}
            <button className="edit-btn">Edit Profile</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecruiterProfile;