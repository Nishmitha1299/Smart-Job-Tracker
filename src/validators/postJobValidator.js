// Import validator library for input validation
import validator from 'validator';
import { useState } from 'react';

const validatePostJob = (initialState) => {
  // State to manage form data and validation errors
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Function to validate job posting fields
  const validate = () => {
    let newErrors = {};

    // Validate company name
    if (validator.isEmpty(formData.company || '')) {
      newErrors.company = "Company name is required";
    }

    // Validate job title
    if (validator.isEmpty(formData.title || '')) {
      newErrors.title = "Job title is required";
    }

    // Validate job description
    if (validator.isEmpty(formData.description || '')) {
      newErrors.description = "Job description is required";
    }

    // Validate job location
    if (validator.isEmpty(formData.location || '')) {
      newErrors.location = "Location is required";
    }

    // Validate skills input (minimum length)
    if (!validator.isLength(formData.skills || '', { min: 3 })) {
      newErrors.skills = "Please enter at least one skill";
    }

    // Validate number of openings
    if (!validator.isInt(formData.openings || '', { min: 1 })) {
      newErrors.openings = "Please enter a valid number of openings";
    }

    // Validate experience level selection
    if (!formData.experience) {
      newErrors.experience = "Please select experience level";
    }

    // Conditional validation for years of experience
    if ((formData.experience === 'Mid' || formData.experience === 'Senior') &&
        !validator.isInt(formData.years || '', { min: 1 })) {
      newErrors.years = "Please enter valid years of experience";
    }

    // Validate application deadline
    if (validator.isEmpty(formData.deadline || '')) {
      newErrors.deadline = "Please select an application deadline";
    } else if (!validator.isISO8601(formData.deadline)) {
      newErrors.deadline = "Invalid date format";
    }

    // Validate job status
    if (!formData.status || (formData.status !== 'active' && formData.status !== 'closed')) {
      newErrors.status = "Please select a valid status";
    }

    // Update error state and return errors
    setErrors(newErrors);
    return newErrors;
  };

  // Handle input changes and update form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  // Return form utilities
  return { formData, errors, handleChange, validate, resetForm };
}

export default validatePostJob;