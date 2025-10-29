// Import global styles and layout components
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// React Router hooks for navigation and routing
import { useNavigate, Outlet, useLocation } from 'react-router-dom'

// React and context imports
import { useEffect, useContext, use } from 'react'
import { AuthContext } from './context/AuthContext'

// Utility to fetch user role from Firestore
import fetchUserRole from './server/db-config/fetchUserRole'

function App() {
  // Initialize navigation and location hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Access authentication state from context
  const { authLoading, user } = useContext(AuthContext);

  useEffect(() => {
    // Redirect users based on role and current path
    async function roleBasedRedirect() {
      if (!authLoading) {
        // If user is logged in and on home page, redirect to their dashboard
        if (user && location.pathname === '/') {
          const role = await fetchUserRole(user.uid);
          navigate(`/${role}-dashboard`);
        }
        // If unauthenticated user tries to access dashboard, redirect to home
        else if (!user && location.pathname.includes('dashboard')) {
          navigate('/');
        }
      }
    }

    roleBasedRedirect();
  }, [authLoading, user, location]); // Re-run when auth state or location changes

  // Prevent rendering until auth state is resolved
  if (authLoading) return null;

  return (
    <>
      {/* Website Body: only shown on root path */}
      {location.pathname === '/' && (
        <div className='container'>
          {/* Navbar */}
          <Navbar />

          {/* Main Hero Section */}
          <div className='main'>
            <div className='main-text'>
              <h1>Track, Apply. Hire.</h1>
              <h1>All in One Place.</h1>
              <h4 className='para-text para-colour' style={{ fontWeight: '400' }}>
                Empowering people to find the right roles and build meaningful careers—together.
              </h4>

              {/* CTA Buttons */}
              <div className='main-buttons'>
                <button className='main-btn-design jobSeeker para-text' onClick={() => navigate("/login")}>
                  Login as Applier
                </button>
                <button className='main-btn-design recruiter para-text' onClick={() => navigate("/login")}>
                  Login as Recruiters
                </button>
              </div>
            </div>

            {/* Hero Illustration */}
            <img src="/src/assets/illustration.jpg" className='main-image' alt="job hunt" />
          </div>

          {/* Service Details Section */}
          <div className='service-details'>
            <h2 className='service-heading'>Get ahead with Smart Jobs</h2>
            <p className='para-text para-colour' style={{ textAlign: 'center' }}>
              We're serving up trusted insights and anonymous conversation, so you'll have the goods you need to succeed.
            </p>

            {/* Service Cards */}
            <div className='service-cards'>
              <div className='card'>
                <img src="/src/assets/post_manage_jobs.png" alt="post_manage_jobs" className='service-image' />
                <h4 className='para-text'>Post & Manage Jobs</h4>
              </div>

              <div className='card'>
                <img src="/src/assets/job.png" alt="find_and_apply" className='service-image' />
                <h4 className='para-text'>Find & Apply For Jobs</h4>
              </div>

              <div className='card'>
                <img src="/src/assets/track_dashboard.png" alt="track_dashboard" className='service-image' />
                <h4 className='para-text'>Track Jobs</h4>
              </div>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      )}

      {/* Nested route outlet for child components */}
      <Outlet />
    </>
  )
}

export default App