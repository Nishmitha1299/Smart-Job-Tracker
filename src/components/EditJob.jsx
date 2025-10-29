
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../server/db-config/firebaseConfig";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../css/EditJob.css";

const EditJobPage = () => {
  // Access job data passed via route state
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;

  // Initialize form state with job data or fallback defaults
  const [formData, setFormData] = useState({
    title: job?.title || "",
    description: job?.description || "",
    location: job?.location || "",
    openings: job?.openings || 1,
    skills: job?.skills || "",
    status: job?.status || "active",
    deadline: job?.deadline || ""
  });

  // Handle input changes and update form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit updated job data to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!job?.id) return;

    await updateDoc(doc(db, "jobs", job.id), formData);
    navigate("/manage-jobs"); // Redirect after update
  };

  // Redirect if no job data is available
  if (!job) {
    navigate("/manage-jobs");
    return null;
  }

  return (
    <>
      {/* Recruiter-specific navigation bar */}
      <Navbar role="recruiter" />

      {/* Job editing form */}
      <div className="edit-job-page">
        <h2>Edit Job: {job.title}</h2>
        <form onSubmit={handleSubmit}>
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Job Title" required />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required />
          <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" required />
          <input name="openings" type="number" value={formData.openings} onChange={handleChange} placeholder="Openings" min="1" />
          <input name="skills" value={formData.skills} onChange={handleChange} placeholder="Enter Skills" />
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <input type="date" value={formData.deadline} name="deadline" onChange={handleChange} required />
          <button type="submit">Update Job</button>
        </form>
      </div>

      {/* Footer component */}
      <Footer />
    </>
  );
};

export default EditJobPage;