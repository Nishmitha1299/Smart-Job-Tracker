// Import styles and layout components
import '../css/SignUp.css'
import Navbar from './Navbar'
import Footer from './Footer'

// Firebase setup and utilities
import { db } from '../server/db-config/firebaseConfig'
import { doc, setDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../server/db-config/firebaseConfig'

// Custom form validation hook
import useFormValidator from '../validators/formValidator'

// Toast notifications
import { toast } from 'react-hot-toast'

// React state
import { useState } from 'react'

export default function SignUp() {
  // Initialize form state and validation
  const { formData, errors, validate, handleChange, resetForm } = useFormValidator({
    fullName: '',
    email: '',
    mobile: '',
    gender: '',
    role: '',
    companyName: '',
    website: '',
    companyLocation: '',
    password: '',
    confirmPassword: ''
  })

  // Track submission state
  const [isSubmit, setIsSubmit] = useState(false)

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmit(true)

    const validateForm = validate()
    setIsSubmit(false)

    // Stop if validation errors exist
    if (Object.keys(validateForm).length > 0) return

    try {
      setIsSubmit(true)

      // Create user with Firebase Auth
      const userCredentials = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredentials.user

      // Save user profile to Firestore under appropriate collection
      await setDoc(doc(db, formData.role === "applier" ? "appliers" : "recruiters", user.uid), {
        uid: user.uid,
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        gender: formData.gender,
        role: formData.role,
        companyName: formData.role === "recruiter" ? formData.companyName : null,
        website: formData.role === "recruiter" ? formData.website : null,
        companyLocation: formData.role === "recruiter" ? formData.companyLocation : null,
        createdAt: new Date().toDateString()
      })

      // Show success message and reset form
      toast.success('Signup successful!')
      resetForm()
      setIsSubmit(false)
    } catch (error) {
      toast.error("Error adding document: ", error.message)
      console.log(error.message)
      setIsSubmit(false)
    }
  }

  return (
    <>
      {/* Top navigation bar */}
      <Navbar />

      {/* Signup form container */}
      <div className="signup-page">
        <h2>Sign Up</h2>
        <form className='signup-form' onSubmit={handleSubmit}>
          {/* Full name input */}
          <input
            type="text"
            placeholder='Enter Your Full Name'
            className='signup-input'
            name='fullName'
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && <p className='error-message'>{errors.fullName}</p>}<br />

          {/* Email input */}
          <input
            type="email"
            placeholder='Email'
            className='signup-input'
            name='email'
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className='error-message'>{errors.email}</p>}<br />

          {/* Mobile number input */}
          <input
            type="mobile"
            placeholder='Mobile Number'
            className='signup-input'
            name='mobile'
            value={formData.mobile}
            onChange={handleChange}
          />
          {errors.mobile && <p className='error-message'>{errors.mobile}</p>}<br />

          {/* Gender selection */}
          <label>Select Gender:</label><br />
          <div className='gender-input'>
            <label htmlFor="male">
              <input type="radio" id='male' name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} />Male
            </label>
            <label htmlFor="female">
              <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} /> Female
            </label>
            <label htmlFor="other">
              <input type="radio" name="gender" value="other" checked={formData.gender === "other"} onChange={handleChange} /> Other
            </label><br />
          </div>
          {errors.gender && <p className='error-message'>{errors.gender}</p>}
          <br />

          {/* Role selection */}
          <label>Select Role:</label><br />
          <div className='role-input'>
            <label htmlFor="applier">
              <input type="radio" id="applier" name="role" value="applier" checked={formData.role === "applier"} onChange={handleChange} /> Applier
            </label>
            <label htmlFor="recruiter">
              <input type="radio" id="recruiter" name="role" value="recruiter" checked={formData.role === "recruiter"} onChange={handleChange} /> Recruiter<br />
            </label>
          </div>
          {errors.role && <p className='error-message'>{errors.role}</p>}
          <br />

          {/* Conditional recruiter fields */}
          {formData.role === "recruiter" && (
            <>
              <h3>Company Details</h3>
              <input
                type="text"
                placeholder='Company Name'
                className='signup-input'
                name='companyName'
                value={formData.companyName}
                onChange={handleChange}
              />
              {errors.companyName && <p className='error-message'>{errors.companyName}</p>}<br />

              <input
                type="url"
                placeholder='Website'
                className='signup-input'
                name='website'
                value={formData.website}
                onChange={handleChange}
              />
              {errors.website && <p className='error-message'>{errors.website}</p>}<br />

              <input
                type="text"
                placeholder='Company Location'
                className='signup-input'
                name='companyLocation'
                value={formData.companyLocation}
                onChange={handleChange}
              />
              {errors.companyLocation && <p className='error-message'>{errors.companyLocation}</p>}<br />
            </>
          )}

          {/* Password fields */}
          <input
            type="password"
            placeholder='Set Password'
            className='signup-input'
            name='password'
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className='error-message'>{errors.password}</p>}<br />

          <input
            type="password"
            placeholder='Confirm Password'
            className='signup-input'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <p className='error-message'>{errors.confirmPassword}</p>}<br />

          {/* Submit button with loading state */}
          <button
            type='submit'
            className={isSubmit ? 'signup-submit-disable-btn' : 'signup-submit-btn'}
            disabled={isSubmit}
          >
            {isSubmit ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Footer section */}
      <Footer />
    </>
  )
}