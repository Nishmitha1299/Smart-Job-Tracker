import Navbar from "./Navbar";
import '../css/RecruiterDashboard.css'
import OverviewCard from '../components/OverviewCards';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faInbox, faUserCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import JobPerformanceTable from '../components/JobPerformanceTable';
import Footer from "./Footer";
import { useContext, useState, useEffect} from "react";
import { AuthContext } from "../context/AuthContext";
import { doc, getDoc, getCountFromServer, collection, getDocs } from "firebase/firestore";
import { db } from "../server/db-config/firebaseConfig";
import Loader from "./Loader";


function RecruiterDashboard() {

  // Access authenticated user and loading state
  const { user, authLoading } = useContext(AuthContext);

  // Local state for recruiter name, job stats, and performance data
  const [recruiterName, setRecruiterName] = useState("");
  const [jobsPosted, setJobsPosted] = useState(0);
  const [applicationStats, setApplicationStats] = useState({total: 0, shortlisted: 0, underReview: 0, interviewScheduled: 0});
  const [jobPerformanceData, setJobPerformanceData] = useState([]);



  useEffect(() => {
  // Fetch recruiter name, job count, application stats, and job performance
  const fetchName = async () => {
    const uid = user?.uid;

    if (!uid) return;

    //Fetch recruiter profile

    try {
      const profileRef = doc(db, "recruiters", uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setRecruiterName(data.fullName || "Recruiter");
      }
    } catch (error) {
      console.error("Error fetching recruiter profile:", error);
    }


    // Fetch total jobs posted
    try {
      const jobSnap = await getCountFromServer(collection(db, "jobs"));
      setJobsPosted(jobSnap.data().count);
    } catch (error) {
      console.error("Error fetching Job Count:", error);
    }

    // Fetch application statistics
    try {
      const appSnap = await getDocs(collection(db, "applications"));
      let total = 0;
      let shortlisted = 0;
      let underReview = 0;
      let interviewScheduled = 0;

      appSnap.forEach((doc) => {
        const data = doc.data();
        total += 1;
        if (data.status === "Shortlisted") shortlisted += 1;
        if (data.status === "Under Review") underReview += 1;
        if (data.status === "Interview Scheduled") interviewScheduled += 1;
      });

      setApplicationStats({ total, shortlisted, underReview, interviewScheduled});
    } catch (error) {
      console.error("Error fetching application stats:", error);
    }

    // Fetch job details
    const jobSnap = await getDocs(collection(db, "jobs"));
    const appSnap = await getDocs(collection(db, "applications"));

    const jobMap = {};

    jobSnap.forEach((jobDoc) => {
      const jobData = jobDoc.data();
      jobMap[jobDoc.id] = {
        title: jobData.title || "Untitled",
        status: jobData.status || "Closed",
        applications: 0,
        shortlisted: 0,
      };
    });

    appSnap.forEach((appDoc) => {
      const appData = appDoc.data();
      const jobId = appData.jobId;
      if (jobMap[jobId]) {
        jobMap[jobId].applications += 1;
        if (appData.status === "Shortlisted") {
          jobMap[jobId].shortlisted += 1;
        }
      }
    });

    setJobPerformanceData(Object.values(jobMap));
  };

  
// Trigger fetch only after auth loading completes
  if (!authLoading && user) {
    fetchName(); // call the function here
  }
}, [authLoading, user]); // add dependencies


// Show loader until all data is ready
if (authLoading || !user || !recruiterName || !jobsPosted || jobPerformanceData.length === 0) return <div className="loader-wrapper"><Loader /></div>;

    return ( 
        <>
        <div className="container">
        <Navbar role="recruiter"/>

        <h1>Hello {recruiterName}</h1>
        <div className="dashboard">
      <div className="overview-row">
        <OverviewCard
          title="Jobs Posted"
          count={jobsPosted}
          icon={<FontAwesomeIcon icon={faBriefcase} />}
          color="#2a9f7c"
        />
        <OverviewCard
          title="Applications Received"
          count={applicationStats.total}
          icon={<FontAwesomeIcon icon={faInbox} />}
          color="#f4a261"
        />
        <OverviewCard
          title="Shortlisted"
          count={applicationStats.shortlisted}
          icon={<FontAwesomeIcon icon={faUserCheck} />}
          color="#e76f51"
        />
        <OverviewCard
          title="Pending Reviews"
          count={applicationStats.underReview}
          icon={<FontAwesomeIcon icon={faClock} />}
          color="#264653"
        />

        <OverviewCard
          title="Interview Scheduled"
          count={applicationStats.interviewScheduled}
          icon={<FontAwesomeIcon icon={faClock} />}
          color="#3b82f6"
        />

      </div>

      {/* Job performance table */}
      <JobPerformanceTable jobs={jobPerformanceData} />


      <Footer/>

    </div>

        </div>

        </>
     );
}

export default RecruiterDashboard;