// React and Firebase imports
import { useEffect, useState, useContext } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../server/db-config/firebaseConfig";
import "../css/ManageApplications.css";
import { toast } from "react-hot-toast";
import Navbar from "./Navbar";
import { getDoc } from "firebase/firestore";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ManageApplications() {
  // Local state for application data and UI controls
  const [applications, setApplications] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [appLoading, setAppLoading] = useState(true);

  // Access authenticated user and loading state
  const { user, authLoading } = useContext(AuthContext);

  // Hook for navigation
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to recruiter login if not authenticated
    if (!authLoading && !user) {
      navigate("/login/recruiter");
    }

    // Fetch all applications and enrich with candidate and job details
    const fetchApplications = async () => {
      setAppLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "applications"));
        const apps = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const appData = docSnap.data();

            // Fetch candidate details from appliers collection
            const userRef = doc(db, "appliers", appData.userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.exists() ? userSnap.data() : {};

            // Fetch job details from jobs collection
            const jobRef = doc(db, "jobs", appData.jobId);
            const jobSnap = await getDoc(jobRef);
            const jobData = jobSnap.exists() ? jobSnap.data() : {};

            // Merge all data into a single application object
            return {
              id: docSnap.id,
              ...appData,
              candidateName: userData.fullName || "N/A",
              candidateEmail: userData.email || "N/A",
              skills: userData.skills || "",
              qualification: userData.qualification || "",
              address: userData.address || "Not provided",
              linkedin: userData.linkedin || "",
              workExperience: userData.workExperience || [],
              jobTitle: jobData.title || "N/A",
              jobLocation: jobData.location || "N/A",
            };
          })
        );
        setApplications(apps);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setAppLoading(false); // Stop showing loader
      }
    };

    // Trigger fetch once auth loading completes
    if (!authLoading) {
      fetchApplications();
    }
  }, [authLoading, user]);

  // Update local status change for a specific application
  const handleStatusChange = (id, newStatus) => {
    setStatusUpdates((prev) => ({ ...prev, [id]: newStatus }));
  };

  // Save updated status to Firestore
  const handleSaveStatus = async (id) => {
    const newStatus = statusUpdates[id];
    if (!newStatus) return;

    try {
      await updateDoc(doc(db, "applications", id), { status: newStatus });
      toast.success("Status updated");

      // Update local application state
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
      setStatusUpdates((prev) => ({ ...prev, [id]: null }));
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status");
    }
  };

  // Show loader while data is being fetched or user is not ready
  if (authLoading || !user || appLoading)
    return <div className="loader-wrapper"><Loader /></div>;

  return (
    <>
      {/* Recruiter-specific navigation bar */}
      <Navbar role="recruiter" />

      {/* Main panel for managing applications */}
      <div className="manage-applications-panel">
        <h2>Manage Applications</h2>
        <p className="tagline">Track, review, and update candidate progress across all job postings.</p>

        {/* Filter dropdown for application status */}
        <div className="filter-header">
          <div className="filter-bar">
            <label htmlFor="statusFilter"><strong>Filter by Status:</strong></label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
            </select>
          </div>
        </div>

        {/* Show fallback message if no applications match filter */}
        {applications.filter((app) => statusFilter === "All" || app.status === statusFilter).length === 0 ? (
          <div className="no-applications">
            <p>No Application Found</p>
          </div>
        ) : (
          // Render filtered application cards
          applications
            .filter((app) => statusFilter === "All" || app.status === statusFilter)
            .map((app) => (
              <div key={app.id} className="application-card">
                <h4>{app.jobTitle} — {app.jobLocation}</h4>
                <p className="muted">Applied on: {new Date(app.appliedAt?.seconds * 1000).toLocaleDateString()}</p>

                {/* Candidate details */}
                <p><strong>👤 Name:</strong> {app.candidateName}</p>
                <p><strong>📧 Email:</strong> {app.candidateEmail}</p>
                <p><strong>🏠 Address:</strong> {app.address}</p>
                <p><strong>🎓 Qualification:</strong> {app.qualification}</p>
                <p><strong>💼 Experience:</strong> {app.experience}</p>

                {/* LinkedIn profile if available */}
                {app.linkedin ? (
                  <p><strong>🔗 LinkedIn:</strong>{" "}
                    <a href={app.linkedin} target="_blank" rel="noopener noreferrer">
                      {app.linkedin}
                    </a>
                  </p>
                ) : (
                  <p><strong>🔗 LinkedIn:</strong> <span className="muted">Not provided</span></p>
                )}

                {/* Work experience block */}
                {app.workExperience.length > 0 ? (
                  <div className="work-experience-block">
                    <strong>📁 Work Experience:</strong>
                    <ul>
                      {app.workExperience.map((exp, i) => (
                        <li key={i}>
                          🏢 {exp.jobRole} at {exp.company} ({exp.experienceYears} yrs)
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p><strong>📁 Work Experience:</strong> <span className="muted">Not provided</span></p>
                )}

                {/* Skill tags */}
                <div className="skill-pills">
                  <strong>🛠 Skills:</strong>
                  {app.skills?.split(",").map((skill, i) => (
                    <span key={i} className="pill">{skill.trim()}</span>
                  ))}
                </div>

                {/* Status update controls */}
                <div className="status-control">
                  <label htmlFor={`status-${app.id}`}><strong>Status:</strong></label>
                  <select
                    id={`status-${app.id}`}
                    className={`status-select ${statusUpdates[app.id] || app.status}`}
                    value={statusUpdates[app.id] || app.status}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                  </select>

                  {/* Save button for status change */}
                  <button className="status-save-btn" onClick={() => handleSaveStatus(app.id)}>
                    Save
                  </button>

                  {/* Current status preview */}
                  <div className="status-preview">
                    <span className="status-note">Current stage: </span>
                    <span className={`status-badge ${app.status.toLowerCase().replace(/\s/g, "-")}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </>
  );
}

export default ManageApplications;