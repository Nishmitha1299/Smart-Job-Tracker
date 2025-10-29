// Import the Navbar component
import Navbar from "./Navbar";

function ApplierDashboard() {
  return (
    <>
      {/* Render the Navbar with role set to 'applier' */}
      <Navbar role="applier" />

      {/* Main dashboard container with centered welcome message */}
      <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Welcome to Applier Dashboard</h2>
      </div>
    </>
  );
}

export default ApplierDashboard;