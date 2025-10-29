// Import routing utilities from React Router
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Import all route components
import App from "../App";
import Login from "../components/Login";
import SignUp from "../components/SignUp";
import RecruiterDashboard from "../components/RecruiterDashboard";
import ApplierDashboard from "../components/Applier/ApplierDashboard";
import PostJob from "../components/PostJob";
import RecruiterJobList from "../components/RecruiterJobList";
import EditJobPage from "../components/EditJob";
import RecruiterProfile from "../components/RecruiterProfile";
import BrowseJobs from "../components/Applier/BrowseJobs";
import ApplicationDashboard from "../components/Applier/ApplicationDashboard";
import SavedJobsDashboard from "../components/Applier/SavedJobsDashboard";
import UserProfile from "../components/Applier/UserProfile";
import ManageApplications from "../components/ManageApplications";

export default function Routes() {
  // Define application routes using React Router's createBrowserRouter
  const router = createBrowserRouter([
    {
      path: "/", // Root path
      element: <App />, // Main layout or wrapper component
      children: [
        { path: "login", element: <Login /> }, // Login route
        { path: "/signup", element: <SignUp /> } // Signup route
      ]
    },

    // Recruiter-specific routes
    { path: "recruiter-dashboard", element: <RecruiterDashboard /> },
    { path: "post-job", element: <PostJob /> },
    { path: "manage-jobs", element: <RecruiterJobList /> },
    { path: "/recruiter/edit-job", element: <EditJobPage /> },
    { path: "/recruiter/profile", element: <RecruiterProfile /> },
    { path: "manage-applications", element: <ManageApplications /> },

    // Applier-specific routes
    { path: "applier-dashboard", element: <ApplierDashboard /> },
    { path: "browse-jobs", element: <BrowseJobs /> },
    { path: "application-dashboard", element: <ApplicationDashboard /> },
    { path: "saved-jobs", element: <SavedJobsDashboard /> },
    { path: "user-profile", element: <UserProfile /> }
  ]);

  return (
    // Provide the router to the application
    <RouterProvider router={router} />
  );
}