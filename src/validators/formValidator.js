// Import validator library for input validation
import validator from 'validator';
import { useState } from 'react';

const useFormValidator = (initialState) => {
  // State to manage form data and validation errors
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Function to validate form fields
  const validate = () => {
    let newErrors = {};

    // Validate full name
    if (validator.isEmpty(formData.fullName || '')) {
      newErrors.fullName = "Full Name is required";
    }

    // Validate email format
    if (!validator.isEmail(formData.email || '')) {
      newErrors.email = "Invalid email format";
    }

    // Validate mobile number (India format)
    if (!validator.isMobilePhone(formData.mobile || '', 'en-IN')) {
      newErrors.mobile = "Invalid mobile number";
    }

    // Ensure gender is selected
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    // Ensure role is selected
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    // Additional checks for recruiter role
    if (formData.role === 'recruiter') {
      if (validator.isEmpty(formData.companyName || '')) {
        newErrors.companyName = "Company Name is required";
      }

      if (validator.isEmpty(formData.website || '')) {
        newErrors.website = "Website is required";
      } else if (!validator.isURL(formData.website || '')) {
        newErrors.website = "Invalid URL format";
      }

      if (validator.isEmpty(formData.companyLocation || '')) {
        newErrors.companyLocation = "Company Location is required";
      }
    }

    // Validate password length
    if (!validator.isLength(formData.password || '', { min: 8 })) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
};

export default useFormValidator;