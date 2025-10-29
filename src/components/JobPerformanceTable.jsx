// Import table-specific styles
import '../css/JobPerformanceTable.css';

function JobPerformanceTable({ jobs }) {
  return (
    <div className="job-table-container">
      {/* Section heading */}
      <h3>Job Performance</h3>

      {/* Job performance table */}
      <table className="job-table">
        <thead>
          <tr>
            {/* Table column headers */}
            <th>Job Title</th>
            <th>Applications</th>
            <th>Shortlisted</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {/* Render each job row */}
          {jobs.map((job, index) => (
            <tr key={index}>
              {/* Job title cell with custom styling */}
              <td className='title'>{job.title}</td>

              {/* Application count */}
              <td>{job.applications}</td>

              {/* Shortlisted count */}
              <td>{job.shortlisted}</td>

              {/* Status badge with conditional styling */}
              <td>
                <span className={`status-badge ${job.status === 'active' ? 'open' : 'closed'}`}>
                  {job.status === 'active' ? '🟢 Open' : '🔴 Closed'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobPerformanceTable;