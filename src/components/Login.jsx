// Import layout components and styles
import Navbar from './Navbar'
import '../css/Login.css'
import Footer from './Footer'

// Import Firebase authentication methods
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../server/db-config/firebaseConfig'

// Toast notifications for feedback
import toast from 'react-hot-toast'

// React hooks for state and navigation
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Utility to fetch user role after login
import fetchUserRole from '../server/db-config/fetchUserRole'

function Login() {
  // Track submission state to disable button and show loading text
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook to navigate programmatically
  const navigate = useNavigate();

  // Handle login form submission
  function handleSubmit(e){
    e.preventDefault();
    setIsSubmitting(true);

    // Extract credentials from form
    const username = e.target.username.value;
    const password = e.target.password.value;

    // Set persistence for maintaining the session and attempt login
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        return signInWithEmailAndPassword(auth, username, password);
      })
      .then(async (userCredential) => {
        // On successful login, store session and redirect based on role
        localStorage.setItem("sessionId", userCredential.user.uid);
        toast.success('Login successful!');
        const role = await fetchUserRole(userCredential.user.uid);
        navigate(`/${role}-dashboard`); // e.g., /recruiter-dashboard
      })
      .catch((error) => {
        // Show error message on failure
        toast.error(error.message);
      })
      .finally(() => setIsSubmitting(false)); // Reset submission state
  }

  return (
    <>
      {/* Top navigation bar */}
      <Navbar />

      {/* Login form container */}
      <div className='login-page'>
        <form className='login-form' onSubmit={handleSubmit}>
          <h2>Log In</h2>
          <p className='para-text' style={{color:'rgba(75, 73, 73, 0.6)'}}>
            Welcome Back! Please enter your credentials.
          </p>

          {/* Username input */}
          <input
            type="text"
            placeholder='Username'
            className='login-input'
            name='username'
            required
          /><br/>

          {/* Password input */}
          <input
            type="password"
            placeholder='Password'
            className='login-input'
            name='password'
            required
          /><br/>

          {/* Submit button with loading state */}
          <button
            type="submit"
            className='login-submit-btn'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Footer section */}
      <Footer />
    </>
  )
}

export default Login;