import { useEffect, useState, useContext } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../server/db-config/firebaseConfig";
import "../../css/ApplicationDashboard.css";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { AuthContext } from "../../context/AuthContext";
import Loader from "../Loader"

const ApplicationDashboard = () => {
  // State to hold all applied job data
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Access authenticated user from context
  const { user } = useContext(AuthContext);

  // Track which status tab is currently active
  const [activeTab, setActiveTab] = useState("All");

  // Store count of jobs per status category
  const [statusCounts, setStatusCounts] = useState({});

  // Track loading state for initial data fetch
  const [loading, setLoading] = useState(true);

  // List of status tabs to display
  const statusTabs = [
    "All",
    "Applied",
    "Interview Scheduled",
    "Rejected",
    "Shortlisted",
    "In Review"
  ];

  // Map tab labels to status values stored in Firestore
  const statusMap = {
    Applied: "applied",
    "Interview Scheduled": "interview scheduled",
    Rejected: "rejected",
    Shortlisted: "shortlisted",
    "In Review": "inreview"
  };

  // Map status values to corresponding CSS classes
  const statusClass = {
    applied: "status-applied",
    "interview scheduled": "status-interviewed",
    rejected: "status-rejected",
    shortlisted: "status-shortlisted",
    inreview: "status-inreview",
  };

  useEffect(() => {
    // Fetch all applications submitted by the current user
    if (!user?.uid) return;

    const fetchApplications = async () => {
      try {
        const q = query(collection(db, "applications"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const jobs = snapshot.docs.map(doc => doc.data());
        setAppliedJobs(jobs);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        // Stop showing loader once fetch completes
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  useEffect(() => {
    // Count jobs per status for badge display
    const counts = {
      All: appliedJobs.length,
      Applied: appliedJobs.filter(job => job.status?.toLowerCase() === "applied").length,
      "Interview Scheduled": appliedJobs.filter(job => job.status?.toLowerCase() === "interview scheduled").length,
      Rejected: appliedJobs.filter(job => job.status?.toLowerCase() === "rejected").length,
      Shortlisted: appliedJobs.filter(job => job.status?.toLowerCase() === "shortlisted").length,
      "In Review": appliedJobs.filter(job => job.status?.toLowerCase() === "inreview").length,
    };
    setStatusCounts(counts);
  }, [appliedJobs]);

  // Filter jobs based on active tab selection
  const filteredJobs = activeTab === "All"
    ? appliedJobs
    : appliedJobs.filter(job =>
        job.status?.toLowerCase() === statusMap[activeTab]
      );

  return (
    <>
      <Navbar role="applier" />
      <div className="job-list-container">
        <h2>Stay on Top of Your Applications</h2>
        <p>Track each role you've applied to and its current status</p>

        {/* Status tab buttons with count badges */}
        <div className="status-tabs">
          {statusTabs.map(status => (
            <button
              key={status}
              className={activeTab === status ? "active-tab" : ""}
              onClick={() => setActiveTab(status)}
            >
              {status} <span className="badge">{statusCounts[status] || 0}</span>
            </button>
          ))}
        </div>

        {/* Show loader while fetching applications */}
        {loading ? (
          <div className="loader-wrapper"><Loader /></div>
        ) : (
          <div className="job-cards">
            {/* Show empty message if no jobs match the active tab */}
            {filteredJobs.length === 0 ? (
              <div className="empty-state">
                <p>No applications found for "{activeTab}".</p>
              </div>
            ) : (
              // Render job cards for each filtered application
              filteredJobs.map((job, index) => (
                <div className="job-card-application" key={index}>
                  <div className="job-card-header">
                    <h3>{job.title}</h3>
                    <span className="applied-caption">
                      Applied on: {job.appliedAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>

                  <div className="job-card-meta">
                    <p><strong>📍 Location:</strong> {job.location}</p>
                    <p><strong>💼 Experience:</strong> {job.experience}</p>

                    {/* Status badge with dynamic styling */}
                    <p className={`job-status ${statusClass[(job.status || "applied").toLowerCase()] || "status-applied"}`}>
                      <strong>📌 Status:</strong> {(job.status || "Applied").toUpperCase()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ApplicationDashboard;