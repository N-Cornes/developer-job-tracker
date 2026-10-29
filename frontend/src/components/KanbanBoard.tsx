import { useMemo, useState, type DragEvent } from 'react'
import type { ApplicationStatus, JobApplication } from '../types'
import { formatDate, isOverdue, salaryRange, statusLabel } from '../utils/format'

interface KanbanBoardProps {
  applications: JobApplication[]
  loading: boolean
  onEdit: (application: JobApplication) => void
  onStatusChange: (application: JobApplication, status: ApplicationStatus) => void | Promise<void>
}

interface KanbanColumn {
  key: string
  title: string
  statuses: ApplicationStatus[]
  dropStatus: ApplicationStatus
}

const columns: KanbanColumn[] = [
  {
    key: 'wishlist',
    title: 'Wishlist',
    statuses: ['WISHLIST'],
    dropStatus: 'WISHLIST'
  },
  {
    key: 'applied',
    title: 'Applied',
    statuses: ['APPLIED'],
    dropStatus: 'APPLIED'
  },
  {
    key: 'interviewing',
    title: 'Interviewing',
    statuses: ['PHONE_SCREEN', 'INTERVIEW', 'TECHNICAL_INTERVIEW'],
    dropStatus: 'PHONE_SCREEN'
  },
  {
    key: 'offer',
    title: 'Offer',
    statuses: ['OFFER'],
    dropStatus: 'OFFER'
  },
  {
    key: 'closed',
    title: 'Closed',
    statuses: ['REJECTED', 'WITHDRAWN'],
    dropStatus: 'REJECTED'
  }
]

export function KanbanBoard({
  applications,
  loading,
  onEdit,
  onStatusChange
}: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const applicationById = useMemo(
    () => new Map(applications.map((application) => [application.id, application])),
    [applications]
  )

  function handleDragStart(event: DragEvent<HTMLElement>, application: JobApplication) {
    setDraggingId(application.id)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(application.id))
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverColumn(null)
  }

  function handleDragOver(event: DragEvent<HTMLElement>, columnKey: string) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnKey)
  }

  function handleDrop(event: DragEvent<HTMLElement>, column: KanbanColumn) {
    event.preventDefault()
    const id = Number(event.dataTransfer.getData('text/plain'))
    const application = applicationById.get(id)

    setDraggingId(null)
    setDragOverColumn(null)

    if (!application || column.statuses.includes(application.status)) return
    void onStatusChange(application, column.dropStatus)
  }

  if (loading) {
    return <div className="empty-state">Loading pipeline…</div>
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
    <div className="kanban-scroll" aria-label="Job application pipeline">
      <div className="kanban-board">
        {columns.map((column) => {
          const columnApplications = applications.filter((application) =>
            column.statuses.includes(application.status)
          )

          return (
            <section
              key={column.key}
              className={`kanban-column ${dragOverColumn === column.key ? 'drag-over' : ''}`}
              onDragOver={(event) => handleDragOver(event, column.key)}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setDragOverColumn(null)
                }
              }}
              onDrop={(event) => handleDrop(event, column)}
            >
              <header className="kanban-column-header">
                <h3>{column.title}</h3>
                <span>{columnApplications.length}</span>
              </header>

              <div className="kanban-column-body">
                {columnApplications.length === 0 ? (
                  <div className="kanban-empty">Drop applications here</div>
                ) : (
                  columnApplications.map((application) => {
                    const overdue = isOverdue(application.nextFollowUpDate)
                    return (
                      <article
                        key={application.id}
                        className={`kanban-card ${draggingId === application.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(event) => handleDragStart(event, application)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="kanban-card-topline">
                          <span className={`status-pill status-${application.status.toLowerCase()}`}>
                            {statusLabel(application.status)}
                          </span>
                          <button
                            type="button"
                            className="card-edit"
                            onClick={() => onEdit(application)}
                          >
                            Edit
                          </button>
                        </div>

                        <div className="kanban-card-title">
                          <strong>{application.companyName}</strong>
                          <span>{application.roleTitle}</span>
                        </div>

                        <div className="kanban-card-meta">
                          <span>{application.location || 'Location not listed'}</span>
                          <span>{salaryRange(application.salaryMin, application.salaryMax)}</span>
                        </div>

                        <div className="kanban-card-dates">
                          <span>
                            <small>Applied</small>
                            {formatDate(application.appliedDate)}
                          </span>
                          <span className={overdue ? 'overdue' : ''}>
                            <small>Follow-up</small>
                            {formatDate(application.nextFollowUpDate)}
                            {overdue && <em>Overdue</em>}
                          </span>
                        </div>

                        {application.contactName && (
                          <div className="kanban-contact">Contact: {application.contactName}</div>
                        )}

                        {application.jobUrl && (
                          <a
                            className="kanban-job-link"
                            href={application.jobUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View posting ↗
                          </a>
                        )}
                      </article>
                    )
                  })
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
