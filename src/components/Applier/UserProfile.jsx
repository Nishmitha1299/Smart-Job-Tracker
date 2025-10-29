import { useEffect, useState, useContext } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../server/db-config/firebaseConfig";
import { AuthContext } from "../../context/AuthContext";
import "../../css/UserProfile.css";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { toast } from "react-hot-toast";
import { validateSingleField } from "../../validators/validateSingleField";
import Loader from "../Loader";

function UserProfile() {
  // Access authenticated user from context
  const { user } = useContext(AuthContext);

  // Local state to hold profile data
  const [profile, setProfile] = useState({ workExperience: [] });

  // Track which field is currently being edited
  const [fieldBeingEdited, setFieldBeingEdited] = useState(null);

  // Store validation errors for form fields
  const [formErrors, setFormErrors] = useState({});

  // Track loading state while fetching profile
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    // Fetch profile data from Firestore for current user
    const fetchProfile = async () => {
      if (!user?.uid) return;
      try {
        const profileRef = doc(db, "appliers", user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
      finally {
        setLoading(false); // Stop showing loader
      }
    };
    fetchProfile();
  }, [user]);

const handleSaveField = async (fieldKey) => {
  const updates = {};
  const errors = {};

  // Validate and prepare updates for grouped workExperience block
  if (fieldKey === "workExperience") {
    const fields = ["company", "jobRole", "experienceYears"];
    fields.forEach((key) => {
      const value = profile[key]?.trim?.() ?? profile[key];
      const error = validateSingleField(key, value);
      if (error) errors[key] = error;
      else updates[key] = value;
    });
  } else {
   // Validate and prepare updates for single field
    const value = profile[fieldKey]?.trim?.() ?? profile[fieldKey];
    const error = validateSingleField(fieldKey, value);
    if (error) {
      errors[fieldKey] = error;
    } else {
      updates[fieldKey] = value;
    }
  }

  // Show validation errors if any
  setFormErrors(errors);
  if (Object.keys(errors).length > 0) return;

  // Save to Firebase
  try {
    const profileRef = doc(db, "appliers", user.uid);
    await updateDoc(profileRef, updates);
    toast.success(`${fieldKey} updated successfully`);
    setFieldBeingEdited(null);
    setFormErrors({});
  } catch (err) {
    console.error(`Error updating ${fieldKey}:`, err);
    toast.error(`Failed to update ${fieldKey}`);
  }
};

const updateExperience = (index, key, value) => {
  // Update local state for a specific experience field
  setProfile((prev) => {
    const updated = [...(prev.workExperience || [])];
    updated[index][key] = value;
    return { ...prev, workExperience: updated };
  });
};

const addNewExperience = () => {
  // Add a new empty experience block to the profile
  setProfile((prev) => ({
    ...prev,
    workExperience: [
      ...(prev.workExperience || []),
      { company: "", jobRole: "", experienceYears: "" },
    ],
  }));
  setFieldBeingEdited(`work-${(profile.workExperience?.length || 0)}`);
};

const handleSaveExperience = async (index) => {
  const exp = profile.workExperience[index];
  const errors = {};

  // Validate each field in the experience block
  ["company", "jobRole", "experienceYears"].forEach((key) => {
    const error = validateSingleField(key, exp[key]);
    if (error) errors[`${key}-${index}`] = error;
  });

  // Show validation errors if any
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  // Save updated experience array to Firestore
  try {
    const profileRef = doc(db, "appliers", user.uid);
    await updateDoc(profileRef, { workExperience: profile.workExperience });
    toast.success("Work experience updated");
    setFieldBeingEdited(null);
    setFormErrors({});
  } catch (err) {
    console.error("Error saving experience:", err);
    toast.error("Failed to save experience");
  }
};

const handleDeleteExperience = async (index) => {
  // Remove experience entry from local state
  const updatedExperience = [...(profile.workExperience || [])];
  updatedExperience.splice(index, 1); // remove the entry

  // Save updated experience array to Firestore
  try {
    const profileRef = doc(db, "appliers", user.uid);
    await updateDoc(profileRef, { workExperience: updatedExperience });
    setProfile((prev) => ({ ...prev, workExperience: updatedExperience }));
    toast.success("Work experience deleted");
    setFieldBeingEdited(null);
  } catch (err) {
    console.error("Error deleting experience:", err);
    toast.error("Failed to delete experience");
  }
};

  return (
    <>
      <Navbar role="applier" />

      {loading ? (<div className="loader-wrapper"><Loader /></div>)
       :
       (
      <div className="user-profile-panel">
        <h2>Your Profile</h2>

        <div className="profile-card">
          <div className="profile-header">
            <img
              src={profile.photoURL || "/src/assets/836.jpg"}
              alt="Profile"
              className="profile-image"
            />
            <div className="profile-details">
              <p><strong>Name:</strong> {profile.fullName || "N/A"}</p>
              <p><strong>Email:</strong> {user?.email || "N/A"}</p>
              <p><strong>Phone:</strong> {profile.mobile || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Modular Fields */}
        <div className="profile-form-card">
          <h3>Additional Details</h3>

          {/* Address */}
          <div className="profile-field">
            <label>Address:</label>
            {fieldBeingEdited === "address" ? (
              <>
                <input
                  type="text"
                  value={profile.address || ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your address"
                />
                {formErrors.address && <p className="error-message">{formErrors.address}</p>}
                <button onClick={() => handleSaveField("address")}>Save</button>
              </>
            ) : (
              <div className="field-inline">
                <span>{profile.address || "Not added"}</span>
                <span className="icon edit-icon" onClick={() => setFieldBeingEdited("address")}>✏️</span>
              </div>

            )}
          </div>

          {/* Qualification */}
          <div className="profile-field">
            <label>Qualification:</label>
            {fieldBeingEdited === "qualification" ? (
              <>
                <input
                  type="text"
                  value={profile.qualification || ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, qualification: e.target.value }))}
                  placeholder="e.g. B.Tech in Computer Science"
                />
                {formErrors.qualification && <p className="error-message">{formErrors.qualification}</p>}
                <button onClick={() => handleSaveField("qualification")}>Save</button>
              </>
            ) : (
              <>
                <div className="field-inline">
                  <span>{profile.qualification || "Not added"}</span>
                  <span className="icon edit-icon" onClick={() => setFieldBeingEdited("qualification")}>✏️</span>
                </div>
              </>
            )}
          </div>

          {/* Skills */}
          <div className="profile-field">
            <label>Skills:</label>
            {fieldBeingEdited === "skills" ? (
              <>
                <input
                  type="text"
                  value={profile.skills || ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, skills: e.target.value }))}
                  placeholder="e.g. React, Firebase, CSS"
                />
                {formErrors.skills && <p className="error-message">{formErrors.skills}</p>}
                <button onClick={() => handleSaveField("skills")}>Save</button>
              </>
            ) : (
              <>
                <div className="field-inline">
                  <span>{profile.skills || "Not added"}</span>
                  <span className="icon edit-icon" onClick={() => setFieldBeingEdited("skills")}>✏️</span>
                </div>

              </>
            )}
          </div>

          {/* Experience Years */}
          <div className="profile-field">
            <label>Previous Work Experience:</label>

            {profile.workExperience?.map((exp, index) => (
              <div key={index} className="experience-entry">
                {fieldBeingEdited === `work-${index}` ? (
                  <>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, "company", e.target.value)}
                      placeholder="Company name"
                    />
                    {formErrors[`company-${index}`] && (
                      <p className="error-message">{formErrors[`company-${index}`]}</p>
                    )}

                    <input
                      type="text"
                      value={exp.jobRole}
                      onChange={(e) => updateExperience(index, "jobRole", e.target.value)}
                      placeholder="Job role"
                    />
                    {formErrors[`jobRole-${index}`] && (
                      <p className="error-message">{formErrors[`jobRole-${index}`]}</p>
                    )}

                    <input
                      type="number"
                      min="0"
                      value={exp.experienceYears}
                      onChange={(e) => updateExperience(index, "experienceYears", e.target.value)}
                      placeholder="Years of experience"
                    />
                    {formErrors[`experienceYears-${index}`] && (
                      <p className="error-message">{formErrors[`experienceYears-${index}`]}</p>
                    )}

                    <button onClick={() => handleSaveExperience(index)}>Save</button>
                  </>
                ) : (
                  <>
                    <div className="experience-inline">
                      <span>
                        {exp.jobRole} at {exp.company} ({exp.experienceYears} yrs)
                      </span>
                      <div className="icon-actions">
                        <span className="icon edit-icon" onClick={() => setFieldBeingEdited(`work-${index}`)}>✏️</span>
                        <span className="icon delete-icon" onClick={() => handleDeleteExperience(index)}>🗑️</span>
                      </div>
                    </div>

                  </>
                )}
              </div>
            ))}

            <button className="add-exp-btn" onClick={addNewExperience}>➕ Add Experience</button>
          </div>

          {/* LinkedIn */}
          <div className="profile-field">
            <label>LinkedIn:</label>
            {fieldBeingEdited === "linkedin" ? (
              <>
                <input
                  type="url"
                  value={profile.linkedin || ""}
                  onChange={(e) => setProfile((prev) => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/your-profile"
                />
                {formErrors.linkedin && <p className="error-message">{formErrors.linkedin}</p>}
                <button onClick={() => handleSaveField("linkedin")}>Save</button>
              </>
            ) : (
              <div className="field-inline">
                {profile.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin}</a>
                ) : (
                  <span className="muted">Not added</span>
                )}
                <span className="icon edit-icon" onClick={() => setFieldBeingEdited("linkedin")}>✏️</span>
              </div>

            )}
          </div>
        </div>
      </div>
       )}
      <Footer />
    </>
  );
}

export default UserProfile;