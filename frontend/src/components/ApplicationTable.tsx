import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type JobApplication
} from '../types'
import { formatDate, isOverdue, salaryRange, statusLabel } from '../utils/format'

interface ApplicationTableProps {
  applications: JobApplication[]
  loading: boolean
  onEdit: (application: JobApplication) => void
  onDelete: (application: JobApplication) => void
  onStatusChange: (application: JobApplication, status: ApplicationStatus) => void
}

export function ApplicationTable({
  applications,
  loading,
  onEdit,
  onDelete,
  onStatusChange
}: ApplicationTableProps) {
  if (loading) {
    return <div className="empty-state">Loading applications…</div>
  }

  if (!applications.length) {
    return (
      <div className="empty-state">
        <strong>No applications found.</strong>
        <span>Add your first application or change the current filters.</span>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table className="applications-table">
        <thead>
          <tr>
            <th>Company / Role</th>
            <th>Status</th>
            <th>Location</th>
            <th>Salary</th>
            <th>Applied</th>
            <th>Follow-up</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => {
            const overdue = isOverdue(application.nextFollowUpDate)
            return (
              <tr key={application.id}>
                <td>
                  <div className="company-cell">
                    <strong>{application.companyName}</strong>
                    <span>{application.roleTitle}</span>
                    {application.jobUrl && (
                      <a href={application.jobUrl} target="_blank" rel="noreferrer">
                        View posting ↗
                      </a>
                    )}
                  </div>
                </td>
                <td>
                  <select
                    className={`status-select status-${application.status.toLowerCase()}`}
                    value={application.status}
                    aria-label={`Status for ${application.companyName} ${application.roleTitle}`}
                    onChange={(event) =>
                      onStatusChange(application, event.target.value as ApplicationStatus)
                    }
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{application.location || '—'}</td>
                <td>{salaryRange(application.salaryMin, application.salaryMax)}</td>
                <td>{formatDate(application.appliedDate)}</td>
                <td>
                  <span className={overdue ? 'follow-up overdue' : 'follow-up'}>
                    {formatDate(application.nextFollowUpDate)}
                    {overdue && <small>Overdue</small>}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => onEdit(application)}>
                      Edit
                    </button>
                    <button className="danger-link" type="button" onClick={() => onDelete(application)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
