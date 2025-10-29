// FontAwesome icon imports for branding
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSuitcase } from '@fortawesome/free-solid-svg-icons'

// Global styles
import '../App.css'

// React Router hooks for navigation and location tracking
import { Link, useNavigate, useLocation } from 'react-router-dom'

// Firebase authentication and logout method
import { auth } from '../server/db-config/firebaseConfig'
import { signOut } from 'firebase/auth'

function Navbar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle logout and redirect to homepage
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.clear(); // optional cleanup
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  // Define public pages where role-based links should be hidden
  const isPublicPage = [
    '/',
    '/signup',
    '/login'
  ].includes(location.pathname);

  return (
    <>
      <nav>
        {/* Logo and brand name */}
        <header>
          <FontAwesomeIcon icon={faSuitcase} style={{ color: "#2a9f7c" }} className='logo' />
          <Link to={"/"} style={{ textDecoration: 'none', color: 'black' }}>
            <h3>Smart Job Tracker</h3>
          </Link>
        </header>

        <div className='nav-items para-text'>
          {/* Render public links only on public pages */}
          {isPublicPage && <>
            <p>About</p>
            <a href='#contact-us' style={{ textDecoration: 'none', color: 'black' }}>
              <p>Contact</p>
            </a>

            {/* Show login buttons on signup page */}
            {location.pathname === "/signup" && <div>
              <button
                className='jobSeeker para-text'
                style={styles.button}
                onClick={() => navigate("/login")}
              >
                Login as Applier
              </button>
              <button
                className='recruiter para-text'
                style={styles.button}
                onClick={() => navigate("/login")}
              >
                Login as Recruiters
              </button>
            </div>}

            {/* Show signup button on login or home page */}
            {(location.pathname === "/login" || location.pathname === "/") && (
              <button
                name='SignUp'
                className='signup-btn'
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
            )}
          </>}

          {/* Recruiter-specific navigation links */}
          {role === 'recruiter' && (
            <>
              <Link to="/recruiter-dashboard" className='links'>Dashboard</Link>
              <Link to="/post-job" className='links'>Post Job</Link>
              <Link to="/manage-jobs" className='links'>Manage Jobs</Link>
              <Link to="/manage-applications" className='links'>Applications</Link>
              <Link to="/recruiter/profile" className='links'>Profile</Link>
              <Link to="#" onClick={handleLogout} className='links'>Logout</Link>
            </>
          )}

          {/* Applier-specific navigation links */}
          {role === 'applier' && (
            <>
              <Link to="/applier-dashboard" className='links'>Dashboard</Link>
              <Link to="/browse-jobs" className='links'>Browse Jobs</Link>
              <Link to="/saved-jobs" className='links'>Saved</Link>
              <Link to="/application-dashboard" className='links'>Applications</Link>
              <Link to="/user-profile" className='links'>Profile</Link>
              <Link to="#" onClick={handleLogout} className='links'>Logout</Link>
            </>
          )}
        </div>
      </nav>
    </>
  )
}

// Inline styles for login buttons
const styles = {
  button: {
    borderRadius: '10px',
    width: '10rem',
    height: '2rem',
    color: 'white',
    marginTop: '10px',
    marginRight: '10px',
    cursor: 'pointer'
  }
}

export default Navbar;