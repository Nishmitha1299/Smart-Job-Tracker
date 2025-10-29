import OverviewCard from '../OverviewCards';
import { faClipboardList, faCheckCircle, faTimesCircle, faBookmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '../../server/db-config/firebaseConfig';
import { useEffect, useState } from 'react';
import '../../css/ApplierOverviewCards.css';

function OverviewCards({ user }) {
  // State to hold count values for each overview card
  const [counts, setCounts] = useState({
    submitted: 0,
    shortlisted: 0,
    rejected: 0,
    saved: 0,
  });

  useEffect(() => {
    // Fetch count data for each category when user is available
    const fetchCounts = async () => {
      if (!user) return;

      // Helper to build query for applications with optional status
      const baseQuery = (status) =>
        query(
          collection(db, 'applications'),
          where('userId', '==', user.uid),
          ...(status ? [where('status', '==', status)] : [])
        );

      // Query for saved jobs
      const savedQuery = query(
        collection(db, 'savedJobs'),
        where('userId', '==', user.uid)
      );

      try {
        // Fetch counts for each category in parallel
        const [submittedSnap, shortlistedSnap, rejectedSnap, savedSnap] = await Promise.all([
          getCountFromServer(baseQuery(null)),           // All submitted applications
          getCountFromServer(baseQuery('Shortlisted')),  // Applications with status "Shortlisted"
          getCountFromServer(baseQuery('Rejected')),     // Applications with status "Rejected"
          getCountFromServer(savedQuery),                // Saved jobs
        ]);

        // Update state with retrieved counts
        setCounts({
          submitted: submittedSnap.data().count,
          shortlisted: shortlistedSnap.data().count,
          rejected: rejectedSnap.data().count,
          saved: savedSnap.data().count,
        });
      } catch (err) {
        console.error('Error fetching overview counts:', err);
      }
    };

    fetchCounts();
  }, [user]);

  // Render overview cards with respective counts and icons
  return (
    <div className="overview-row">
      <OverviewCard
        title="Applications Submitted"
        count={counts.submitted}
        icon={<FontAwesomeIcon icon={faClipboardList} />}
        color="#2a9f7c"
      />
      <OverviewCard
        title="Shortlisted"
        count={counts.shortlisted}
        icon={<FontAwesomeIcon icon={faCheckCircle} />}
        color="#f4a261"
      />
      <OverviewCard
        title="Rejected"
        count={counts.rejected}
        icon={<FontAwesomeIcon icon={faTimesCircle} />}
        color="#e76f51"
      />
      <OverviewCard
        title="Saved Jobs"
        count={counts.saved}
        icon={<FontAwesomeIcon icon={faBookmark} />}
        color="#264653"
      />
    </div>
  );
}

export default OverviewCards;