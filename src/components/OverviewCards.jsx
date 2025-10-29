// Import styles specific to overview cards
import '../css/OverviewCards.css';

function OverviewCard({ title, count, icon, color }) {
  return (
    // Card container with colored left border for visual emphasis
    <div className="overview-card" style={{ borderLeft: `5px solid ${color}` }}>
      <div className="card-content">
        {/* Optional icon with dynamic color */}
        {icon && <span className="card-icon" style={{ color }}>{icon}</span>}

        {/* Card title */}
        <h4>{title}</h4>

        {/* Count value displayed prominently */}
        <p>{count}</p>
      </div>
    </div>
  );
}

export default OverviewCard;