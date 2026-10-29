import type { JobApplication } from '../types'
import { formatDate, statusLabel } from '../utils/format'

interface NeedsAttentionProps {
  applications: JobApplication[]
  loading: boolean
  onEdit: (application: JobApplication) => void
  onReschedule: (application: JobApplication, date: string | null) => Promise<void>
}

function localDateString(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-')
}

export function NeedsAttention({
  applications,
  loading,
  onEdit,
  onReschedule
}: NeedsAttentionProps) {
  const today = localDateString()
  const overdue = applications.filter(
    (application) => application.nextFollowUpDate && application.nextFollowUpDate < today
  )
  const dueToday = applications.filter(
    (application) => application.nextFollowUpDate === today
  )

  return (
    <section className="attention-panel" aria-labelledby="attention-title">
      <div className="attention-heading">
        <div>
          <span className="eyebrow">Follow-ups</span>
          <h2 id="attention-title">Needs Attention</h2>
          <p>Stay on top of recruiter replies and application follow-ups.</p>
        </div>
        <div className="attention-counts" aria-label="Follow-up summary">
          <span><strong>{overdue.length}</strong> overdue</span>
          <span><strong>{dueToday.length}</strong> due today</span>
        </div>
      </div>

      {loading ? (
        <div className="attention-empty">Checking follow-ups…</div>
      ) : applications.length === 0 ? (
        <div className="attention-empty success">
          <strong>You’re caught up.</strong>
          <span>No follow-ups are due right now.</span>
        </div>
      ) : (
        <div className="attention-list">
          {applications.map((application) => {
            const isOverdue = Boolean(
              application.nextFollowUpDate && application.nextFollowUpDate < today
            )
            return (
              <article className={`attention-card${isOverdue ? ' overdue' : ''}`} key={application.id}>
                <div className="attention-card-main">
                  <div className="attention-card-title">
                    <span className={`attention-badge ${isOverdue ? 'overdue' : 'today'}`}>
                      {isOverdue ? 'Overdue' : 'Due today'}
                    </span>
                    <strong>{application.companyName}</strong>
                    <span>{application.roleTitle}</span>
                  </div>
                  <div className="attention-card-meta">
                    <span>{statusLabel(application.status)}</span>
                    <span>Follow up {formatDate(application.nextFollowUpDate)}</span>
                    {application.contactName && <span>Contact: {application.contactName}</span>}
                  </div>
                </div>

                <div className="attention-actions">
                  <button type="button" className="attention-action" onClick={() => onEdit(application)}>
                    Open
                  </button>
                  <button
                    type="button"
                    className="attention-action"
                    onClick={() => void onReschedule(application, localDateString(1))}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    className="attention-action"
                    onClick={() => void onReschedule(application, localDateString(7))}
                  >
                    +7 days
                  </button>
                  <button
                    type="button"
                    className="attention-action done"
                    onClick={() => void onReschedule(application, null)}
                  >
                    Done
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
