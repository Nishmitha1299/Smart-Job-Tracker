// Function to validate a single form field based on its key and value
export function validateSingleField(fieldKey, value) {
  // Trim whitespace from input if possible
  const trimmed = value?.trim?.() ?? value;

  // Switch-case to handle validation logic for each field
  switch (fieldKey) {
    // Validate LinkedIn URL format
    case "linkedin":
      if (!/^https:\/\/(www\.)?linkedin\.com\/(in|company)\/[\w\-\.]+/.test(trimmed)) {
        return "Please enter a valid LinkedIn profile or company URL.";
      }
      break;

    // Validate address presence
    case "address":
      if (!trimmed) return "Address is required.";
      break;

    // Validate qualification presence
    case "qualification":
      if (!trimmed) return "Qualification is required.";
      break;

    // Validate skills input
    case "skills":
      if (!trimmed) return "Please list at least one skill.";
      break;

    // Validate company name length
    case "company":
      if (!trimmed || trimmed.length < 2) return "Company name is required.";
      break;

    // Validate job role length
    case "jobRole":
      if (!trimmed || trimmed.length < 2) return "Job role is required.";
      break;

    // Validate numeric input for experience years
    case "experienceYears":
      if (!value || isNaN(value) || value < 1) return "Enter a valid number of years.";
      break;

    // Default case: no validation error
    default:
      return null;
  }

  // Return null if no error found
  return null;
}