// Component to display a personalized welcome message
function WelcomeBanner({ user }) {
 
  return (
    <div className="welcome-banner">
      {/* Display user's name if available, fallback to 'Applier' */}
      <h1>Hi {user || 'Applier'} 👋</h1>

      {/* Subheading to encourage engagement */}
      <p>Ready to find your next opportunity?</p>
    </div>
  );
}

export default WelcomeBanner;