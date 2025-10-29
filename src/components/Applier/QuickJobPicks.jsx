// React and Firebase imports
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../server/db-config/firebaseConfig';
import '../../css/QuickJobPicks.css';
import { useNavigate } from 'react-router-dom';

function QuickJobPicks({ user }) {
  // Local state to store fetched jobs
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the latest 4 active jobs from Firestore
    const fetchJobs = async () => {
      try {
        const jobsQuery = query(
          collection(db, 'jobs'),               // Target 'jobs' collection
          orderBy('createdAt', 'desc'),         // Sort by most recent
          limit(4)                               // Limit to 4 entries
        );

        const jobsSnap = await getDocs(jobsQuery);

        // Map documents to job objects and filter out closed jobs
        const jobList = jobsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(job => job.status?.toLowerCase() === "active");

        setJobs(jobList); // Update state with active jobs
      } catch (err) {
        console.error('Error fetching quick job picks:', err);
      }
    };

    fetchJobs(); // Trigger fetch on mount
  }, []);

  return (
    <div className="quick-picks-panel">
      {/* Show fallback message if no jobs available */}
      {jobs.length === 0 ? (
        <p className="empty-message">No active job suggestions available right now.</p>
      ) : (
        <>
          {/* Render each job card */}
          {jobs.map((job) => (
            <div key={job.id} className="quick-job-card">
              <h4>{job.title}</h4>
              <p>{job.company} • {job.location}</p>
            </div>
          ))}

          {/* CTA to view full job list */}
          <div className="view-all-wrapper">
            <button className="view-all-btn" onClick={() => navigate('/browse-jobs')}>
              View All Jobs
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default QuickJobPicks;