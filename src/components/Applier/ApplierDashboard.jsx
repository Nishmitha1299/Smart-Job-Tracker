import Navbar from '../Navbar';
import Footer from '../Footer';
import '../../css/ApplierDashboard.css';
import WelcomeBanner from './WelcomeBanner';
import OverviewCards from './ApplierOverviewCards';
import SavedJobsPanel from './SavedJobs';
import QuickJobPicks from './QuickJobPicks';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../Loader';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../server/db-config/firebaseConfig';
import '../../css/ApplierOverviewCards.css';
import '../../css/SavedJobsPanel.css';

function ApplierDashboard() {
  const { user, authLoading } = useContext(AuthContext);
  const [name, setName] = useState('');

  // Action: Fetch the applier's display name from Firestore when authenticated user is available
  useEffect(() => {
    const fetchUsername = async () => {
      // Guard: if no authenticated user, skip fetching
      if (!user) return;

      try {
        // Action: build a reference to the applier document in Firestore
        const docRef = doc(db, 'appliers', user.uid);
        // Action: read the document from Firestore
        const docSnap = await getDoc(docRef);
        // Action: if profile exists, update local state with the full name
        if (docSnap.exists()) {
          setName(docSnap.data().fullName || 'Applier');
        } else {
          // Action: log missing profile (no state update)
          console.warn('No applier profile found');
        }
      } catch (err) {
        // Action: log any fetch/read error
        console.error('Error fetching username:', err);
      }
    };

    // Action: trigger fetch only after auth finishes and user is present
    if (!authLoading && user) fetchUsername();
  }, [authLoading, user]);


  // Action: while auth is loading or required data is missing, show loader
  if (authLoading || !user || !name) return <div className='loader-wrapper'><Loader /></div>;

  // Action: render dashboard UI once data is ready
  return (
    <div className="container">
      {/* Action: render navbar with role prop */}
      <Navbar role="applier" />

      {/* Action: welcome banner with fetched user name */}
      <WelcomeBanner user={name} />

      <div className="dashboard">
        <section className="overview-section">
          {/* Action: show overview summary cards */}
          <h2 className="section-title">Your Job Hunt Summary</h2>
          <OverviewCards user={user} />
        </section>

        <section className="saved-jobs-section">
          {/* Action: show saved jobs panel */}
          <h2><span className="job-icon">📌</span>Saved Jobs</h2>
          <SavedJobsPanel/>
        </section>

        <section className="quick-picks-section">
          {/* Action: show quick job suggestions */}
          <h2><span className="icon">⚡</span>Suggested Jobs</h2>
          <QuickJobPicks/>
        </section>
      </div>

      {/* Action: render footer */}
      <Footer />
    </div>
  );
}

export default ApplierDashboard;