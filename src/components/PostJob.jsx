import '../css/PostJob.css';
import { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import validatePostJob from '../validators/postJobValidator';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../server/db-config/firebaseConfig';
import toast from 'react-hot-toast';

function PostJob() {
  // Initialize form validation and state management
  const { formData, errors, handleChange, validate, resetForm} = validatePostJob({
    company: '',
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    openings: '',
    skills: '',
    experience: 'Entry',
    years: '',
    deadline: '',
    status: 'active'
  });

  // Track posting state to disable button and show loading text
  const [isPosting, setIsPosting] = useState(false);

  // Handle input changes and reset years if experience is 'Entry'
  function handleChangeWithReset(e) {

    const { name, value } = e.target;
    if (name === 'experience' && value === 'Entry') {
      handleChange({ target: { name: 'years', value: '' } });
    }
    handleChange(e);
  
  }

  // Submit job post to Firebase after validation
  async function handleSubmit(e) {
    e.preventDefault();
    setIsPosting(true);

    const validationErrors = validate();
    console.log(validationErrors);

    // Stop submission if validation fails
    if (Object.keys(validationErrors).length > 0) {
      setIsPosting(false);
      return;
    }
    

    try {
      console.log('Job Posted:', formData);

    // Add job document to Firebase
     await addDoc(collection(db, "jobs"), {
      company: formData.company,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      type: formData.type,
      openings: parseInt(formData.openings),
      skills: formData.skills.split(',').map(skill => skill.trim()),
      experience: formData.experience,
      years: formData.experience === 'Entry' ? 0 : formData.years,
      deadline: formData.deadline,
      status: formData.status,
      createdAt : new Date()
     });

     // Reset form and show success toast
     resetForm();
     toast.success('Job posted successfully!');
     setIsPosting(false);
      
    } catch (error) {
      console.log('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
      setIsPosting(false);
    }

    
  }

  return (
    <>
    {/* Recruiter-specific navigation bar */}
    <Navbar role="recruiter"/>

    {/* Job posting form */}
    <form className="post-job-form" onSubmit={handleSubmit}>
      <h2>Post a New Job</h2>
      
      <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleChangeWithReset} />
      {errors.company && <span className="error-message">{errors.company}</span>}

      <input type="text" name="title" placeholder="Job Title" value={formData.title} onChange={handleChangeWithReset} />
      {errors.title && <span className="error-message">{errors.title}</span>}

      <textarea name="description" placeholder="Job Description" value={formData.description} onChange={handleChangeWithReset} />
      {errors.description && <span className="error-message">{errors.description}</span>}

      <input type="text" name="location" placeholder="Location (e.g., Mumbai or Remote)" value={formData.location} onChange={handleChangeWithReset} />
      {errors.location && <span className="error-message">{errors.location}</span>}

      <select name="type" value={formData.type} onChange={handleChangeWithReset}>
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Contract</option>
      </select>
      {errors.type && <span className="error-message">{errors.type}</span>}

      <input type="number" placeholder='Number of openings' name='openings' value={formData.openings} onChange={handleChangeWithReset} min="1" />
      {errors.openings && <span className="error-message">{errors.openings}</span>}

      <input type="text" name="skills" placeholder="Skills (comma separated)" value={formData.skills} onChange={handleChangeWithReset} />
      {errors.skills && <span className="error-message">{errors.skills}</span>}

      <select name="experience" value={formData.experience} onChange={handleChangeWithReset}>
        <option>Entry</option>
        <option>Mid</option>
        <option>Senior</option>
      </select>
      {errors.experience && <span className="error-message">{errors.experience}</span>}

      {formData.experience !== 'Entry' && (
        <input type="number" name="years" placeholder="Years of Experience" value={formData.years} onChange={handleChangeWithReset} min="2" />
      )}
      {errors.years && <span className="error-message">{errors.years}</span>}

      <input type="date" name="deadline" value={formData.deadline} onChange={handleChangeWithReset} />
      {errors.deadline && <span className="error-message">{errors.deadline}</span>}

      <select name='status' value={formData.status} onChange={handleChangeWithReset}>
        <option value="active">Active</option>
        <option value="closed">Closed</option>
      </select>
      {errors.status && <span className="error-message">{errors.status}</span>}

      {/* Submit button with loading state */}
      <button type="submit" className={isPosting ? "post-job-form-disable-btn" : "post-job-form-button"} disabled={isPosting}>{isPosting ? "Posting..." : "Post Job"}</button>
    </form>

    {/* Footer section */}
    <Footer/>
    </>
  );
}

export default PostJob;