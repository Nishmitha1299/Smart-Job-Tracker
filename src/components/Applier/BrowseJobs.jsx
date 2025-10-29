import { useEffect, useState, useContext } from "react";
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../server/db-config/firebaseConfig";
import "../../css/BrowseJobs.css";
import Navbar from "../Navbar";
import { FaBookmark } from "react-icons/fa";
import {AuthContext} from '../../context/AuthContext'
import { toast } from "react-hot-toast";
import Loader from "../Loader";

// Utility to calculate how long ago a job was posted
const getTimeAgo = (timestamp) => {
  if (!timestamp?.toDate) return "Unknown";
  const now = new Date();
  const posted = timestamp.toDate();
  const diffMs = now - posted;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return "Today";
};


// Utility to format deadline into readable status
const getDeadlineDisplay = (deadlineStr) => {
  if (!deadlineStr) return "Not set";

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (isNaN(deadline.getTime())) return "Invalid date";
  if (diffDays < 0) return "Expired";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;

  return deadline.toLocaleDateString();
};


const BrowseJobs = () => {
  // Local state for job list, search term, modal, saved/applied jobs, and loading
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [jobLoading, setJobLoading] = useState(true);

  // Access authenticated user from context
  const {user} = useContext(AuthContext);


  useEffect(() => {
    // Listen to real-time updates from jobs collection
  const unsubscribe = onSnapshot(collection(db, "jobs"), (snapshot) => {
    const now = new Date();
    const updatedJobs = [];

    // Process each job document
    const allJobs = snapshot.docs.map(docSnap => {
      const job = { id: docSnap.id, ...docSnap.data() };
      const deadline = new Date(job.deadline);
      const isExpired = deadline < now;

      // If expired and status is still 'active', update it to 'closed'
      if (isExpired && job.status === "active") {
        const jobRef = doc(db, "jobs", job.id);
        setDoc(jobRef, { ...job, status: "closed" }, { merge: true });
        job.status = "closed"; // Update locally too
      }

      updatedJobs.push(job);
      return job;
    });

    setJobs(updatedJobs);
    setJobLoading(false); // Stop showing loader
  });

  return () => unsubscribe(); // Cleanup listener on unmount
}, []);



useEffect(() => {
  // Fetch saved jobs for current user
  if (!user?.uid) return;

  const fetchSavedJobs = async () => {
    try {
      const q = query(collection(db, "savedJobs"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const savedIds = snapshot.docs.map(doc => doc.data().jobId);
      setSavedJobs(new Set(savedIds));
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
    }
  };

  fetchSavedJobs();
}, [user]);


// Toggle save/unsave job for current user
  const toggleSave = (jobId) => {

    const docRef = doc(db, "savedJobs", `${user.uid}_${jobId}`);
    if (savedJobs.has(jobId)) {
      deleteDoc(docRef).catch(err => console.error("Error removing saved job:", err));
    } else {
      setDoc(docRef, {
        userId: user.uid,
        jobId: jobId, savedAt: new Date()
      }).catch(err => console.error("Error saving job:", err));
    }

    // Update local savedJobs set
  setSavedJobs(prev => {
    const updated = new Set(prev);
    updated.has(jobId) ? updated.delete(jobId) : updated.add(jobId);
    return updated;
  });
};

useEffect(() => {
  // Fetch jobs already applied to by current user
  if (!user?.uid) return;

  const fetchAppliedJobs = async () => {
    try {
      const q = query(collection(db, "applications"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      const appliedIds = snapshot.docs.map(doc => doc.data().jobId);
      setAppliedJobs(new Set(appliedIds));
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
    }
  };

  fetchAppliedJobs();
}, [user]);


  // Filter jobs based on search and deadline validity
  const filteredJobs = jobs.filter(job => {
  const deadlineStatus = getDeadlineDisplay(job.deadline);
  const isActive = deadlineStatus !== "Expired" && deadlineStatus !== "Invalid date";

  const matchesSearch =
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase());

  return isActive && matchesSearch;
});

  // Handle job application submission
  const handleApply = async (job) => {
    if(!user?.uid || !job?.id) return;

    const docRef = doc(db, "applications", `${user.uid}_${job.id}`);

    try {
      await setDoc(docRef, {
        userId: user.uid,
        jobId: job.id,
        appliedAt: new Date(),
        title: job.title,
        location: job.location,
        experience: job.experience,
        status: "applied"
      });

      toast.success(`Applied to ${job.title} successfully!`);
      setAppliedJobs(prev => new Set(prev).add(job.id)); //mark as applied
    } catch (err) {
      console.error("Error applying to job:", err);
      toast.error("Failed to apply. Please try again.");
    }

  };

  // Render job list and modal
  return (
    <>
      {/* Navbar for applier role */}
      <Navbar role="applier" />
      <div className="job-list-container">
        {/* Header and search bar */}
        <h1>Find Your Next Opportunity</h1>
        <p>Search jobs by role, location, or company</p>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search job title or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Show loader while jobs are being fetched */}
        {jobLoading ? (
            <div className="loader-wrapper">
              <Loader />
            </div>
          ) : 
        (
        <div className="job-cards">
          {/* Show empty message if no jobs match */}
          {filteredJobs.length === 0 ? (
            <div className="no-jobs-message">
              <p>No Vacancies Available</p>
            </div>
          ) : (
            // Render job cards
            filteredJobs.map(job => (
              <div key={job.id} className="job-card" onClick={() => setSelectedJob(job)}>
                {appliedJobs.has(job.id) && (
                  <span className="applied-badge">Applied</span>
                )}
                <div className="job-card-header">
                  <h3>{job.title}</h3>
                  <span className="posted-caption">posted {getTimeAgo(job.createdAt)}</span>
                </div>

                <div className="job-card-meta">
                  <p><strong>📍 Location:</strong> {job.location}</p>
                  <p><strong>💼 Experience:</strong> {job.experience}</p>
                  <p><strong>🛠️ Skills:</strong></p>
                  <div className="pill-container">
                    {job.skills?.length > 0
                      ? job.skills.map((skill, index) => (
                          <span key={index} className="pill">{skill}</span>
                        ))
                      : <span className="pill">Not Specified</span>
                    }
                  </div>

                  {/* Deadline styling based on urgency */}
                  <p className={/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(getDeadlineDisplay(job.deadline))? "deadline-soft": "deadline-urgent"}>
                    <strong>⏳ Deadline:</strong> {getDeadlineDisplay(job.deadline)}
                  </p>
                </div>

                {/* Bookmark toggle */}
                <div className="job-card-footer" onClick={e => e.stopPropagation()}>
                  <span
                    className={`bookmark-icon ${savedJobs.has(job.id) ? "saved" : ""}`}
                    onClick={() => toggleSave(job.id)}
                    title={savedJobs.has(job.id) ? "Saved" : "Save Job"}
                  >
                    <FaBookmark className="bookmark-icon-svg" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (

        <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="job-modal-applier" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.title}</h2>
              <p className="modal-subtext">📍 {selectedJob.location} &nbsp; | &nbsp; 💼 {selectedJob.experience} &nbsp; | &nbsp; 👥 Openings: {selectedJob.openings}</p>
            </div>

            <div className="modal-body">
              <p><strong>Description:</strong></p>
              <p className="modal-body-text">{selectedJob.description || "No description provided."}</p>
              <p><strong>Skills:</strong> </p>
              <p className="modal-body-text">{selectedJob.skills?.join(", ") || "Not specified."}</p>
              <p><strong>Type:</strong> </p>
              <p className="modal-body-text">{selectedJob.type || "Not specified."}</p>
              
            </div>

            <div className="modal-actions">
              <div className="modal-deadline">
                <p className={/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(getDeadlineDisplay(selectedJob.deadline))? "deadline-soft": "deadline-urgent"}>
                  <strong>⏳ Deadline:</strong> {getDeadlineDisplay(selectedJob.deadline)}
                </p>
              </div>

              <div className="modal-buttons">
                <button className="apply-btn" onClick={() => handleApply(selectedJob)} disabled={appliedJobs.has(selectedJob.id)}>{appliedJobs.has(selectedJob.id) ? "Applied" : "Apply Now"}</button>
                <button className="close-btn" onClick={() => setSelectedJob(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
};

export default BrowseJobs;