// React and Firebase imports
import { useEffect, useState, useContext } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../server/db-config/firebaseConfig';
import '../../css/SavedJobsPanel.css';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SavedJobsPanel() {
  // Local state to hold saved job data
  const [savedJobs, setSavedJobs] = useState([]);

  // Access authenticated user from context
  const { user } = useContext(AuthContext);

  // Navigation hook for routing
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the latest 4 saved jobs for the current user
    const fetchSavedJobs = async () => {
      if (!user) return;

      try {
        // Query savedJobs collection for current user, sorted by savedAt
        const savedQuery = query(
          collection(db, 'savedJobs'),
          where('userId', '==', user.uid),
          orderBy('savedAt', 'desc'),
          limit(4)
        );

        const savedSnap = await getDocs(savedQuery);

        // For each saved job, fetch the corresponding job details
        const jobPromises = savedSnap.docs.map(async (docSnap) => {
          const jobRef = doc(db, 'jobs', docSnap.data().jobId);
          const jobSnap = await getDoc(jobRef);
          return jobSnap.exists() ? { id: jobSnap.id, ...jobSnap.data() } : null;
        });

        const jobs = await Promise.all(jobPromises);

        // Filter out jobs that are not active
        const activeJobs = jobs.filter(job => job && job.status?.toLowerCase() === "active");

        // Update local state with active saved jobs
        setSavedJobs(activeJobs);

      } catch (err) {
        console.error('Error fetching saved jobs:', err);
      }
    };

    fetchSavedJobs(); // Trigger fetch on mount
  }, [user]);

  return (
    <div className="saved-jobs-panel">
      {/* Show fallback message if no active saved jobs */}
      {savedJobs.length === 0 ? (
        <p className="empty-message">No active saved jobs available.</p>
      ) : (
        <>
          {/* Render saved job cards */}
          <div className="saved-jobs-grid">
            {savedJobs.map((job) => (
              <div key={job.id} className="saved-job-card">
                <h4>{job.title}</h4>
                <p>{job.company} • {job.location}</p>
              </div>
            ))}
          </div>

          {/* CTA to view full saved jobs list */}
          <div className="see-all-wrapper">
            <button className="see-all-btn" onClick={() => navigate("/saved-jobs")}>See All Saved Jobs</button>
          </div>
        </>
      )}
    </div>
  );
}

export default SavedJobsPanel;