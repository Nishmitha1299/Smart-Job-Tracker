// React and Firebase imports
import { useEffect, useState, useContext } from "react";
import { collection, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../server/db-config/firebaseConfig";

// Styling and layout components
import "../css/RecruiterJobList.css";
import Navbar from "./Navbar";
import { FaEdit, FaTimes, FaEye } from 'react-icons/fa';
import Loader from "./Loader";
import { AuthContext } from "../context/AuthContext";

// Utility to format job posting time
const getTimeAgo = (timestamp) => {
  if (!timestamp?.toDate) return "Unknown";

  const now = new Date();
  const posted = timestamp.toDate();
  const diffMs = now - posted;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  return "Just now";
};

const RecruiterJobList = () => {
  // Local state for job list, filters, modal, and loading
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Access authenticated user and loading state
  const { user, authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate("/login/recruiter");
    }

    // Subscribe to real-time job updates
    const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
      const allJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(allJobs);
      setIsLoading(false);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, []);

  // Navigate to edit job page with job data
  const handleEdit = (job) => {
    navigate("/recruiter/edit-job", { state: { job } });
  };

  // Mark job as closed and update local state
  const handleClose = async (jobId) => {
    await updateDoc(doc(db, "jobs", jobId), { status: "closed", openings: 0 });
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: "closed", openings: 0 } : j));
  };

  // Filter jobs based on status and search term
  const filteredJobs = jobs
    .filter(job => filter === "all" ? true : job.status === filter)
    .filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <>
      {/* Recruiter-specific navigation bar */}
      <Navbar role="recruiter" />

      {/* Main job list container */}
      <div className="job-list-container">
        {/* Filter and search bar */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search job title..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select onChange={e => setFilter(e.target.value)}>
            <option value="all" className="para-text">All</option>
            <option value="active" className="para-text">Active</option>
            <option value="closed" className="para-text">Closed</option>
          </select>
        </div>

        {/* Show loader while fetching jobs */}
        {isLoading ? (
          <div className="loader-wrapper"><Loader /></div>
        ) : (
          <div className="job-cards">
            {/* Render filtered job cards */}
            {filteredJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <span className={`status-badge ${job.status}`}>{job.status}</span>
                </div>

                <div className="job-card-meta">
                  <p><strong>📍 Location:</strong> {job.location}</p>
                  <p><strong>💼 Experience:</strong> {job.experience}</p>
                  <p><strong>👥 Openings:</strong> {job.openings}</p>
                  <p><strong>📅 Posted:</strong> {getTimeAgo(job.createdAt)}</p>
                  <p><strong>⏳ Deadline:</strong> {job.deadline || "Not set"}</p>
                </div>

                {/* Action buttons for edit, close, and view */}
                <div className="job-card-actions">
                  {job.status === "active" && (
                    <>
                      <button onClick={() => handleEdit(job)} title="Edit"><FaEdit /></button>
                      <button onClick={() => handleClose(job.id)} title="Close"><FaTimes /></button>
                    </>
                  )}
                  <button onClick={() => setSelectedJob(job)} title="View"><FaEye /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job details modal */}
        {selectedJob && (
          <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
            <div className="job-modal" onClick={e => e.stopPropagation()}>
              <h2>{selectedJob.title}</h2>
              <p><strong>📍 Location:</strong> {selectedJob.location}</p>
              <p><strong>👥 Openings:</strong> {selectedJob.openings}</p>
              <p><strong>💼 Experience:</strong> {selectedJob.experience}</p>
              <p><strong>📅 Posted on:</strong> {selectedJob.createdAt?.toDate().toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`status ${selectedJob.status}`}>{selectedJob.status}</span></p>
              <p><strong>Description:</strong> {selectedJob.description || "No description provided."}</p>
              <p><strong>Skills:</strong> {selectedJob.skills?.join(", ") || "Not specified."}</p>
              <button className="close-btn" onClick={() => setSelectedJob(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RecruiterJobList;