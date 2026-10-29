import { useCallback, useEffect, useState } from 'react'
import {
  createApplication,
  deleteApplication,
  getApplications,
  getNeedsAttention,
  getStats,
  updateApplication,
  updateApplicationFollowUp,
  updateApplicationStatus
} from './api/applications'
import { getCurrentUser } from './api/auth'
import { clearAuthToken, getAuthToken, setAuthToken } from './api/client'
import { ApplicationForm } from './components/ApplicationForm'
import { ApplicationTable } from './components/ApplicationTable'
import { AuthScreen } from './components/AuthScreen'
import { KanbanBoard } from './components/KanbanBoard'
import { NeedsAttention } from './components/NeedsAttention'
import { StatsGrid } from './components/StatsGrid'
import {
  APPLICATION_STATUSES,
  type ApplicationStats,
  type ApplicationStatus,
  type AuthResponse,
  type AuthUser,
  type JobApplication,
  type JobApplicationPayload
} from './types'
import { statusLabel } from './utils/format'

function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [stats, setStats] = useState<ApplicationStats | null>(null)
  const [attention, setAttention] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState<JobApplication | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [view, setView] = useState<'board' | 'table'>(() =>
    window.localStorage.getItem('job-tracker-view') === 'table' ? 'table' : 'board'
  )

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      if (!getAuthToken()) {
        setAuthReady(true)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (!cancelled) setUser(currentUser)
      } catch {
        clearAuthToken()
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }

    void restoreSession()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    function expireSession() {
      setUser(null)
      setApplications([])
      setAttention([])
      setStats(null)
      setError('Your session expired. Sign in again to continue.')
    }

    window.addEventListener('job-tracker-auth-expired', expireSession)
    return () => window.removeEventListener('job-tracker-auth-expired', expireSession)
  }, [])

  const loadData = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const [applicationData, statsData, attentionData] = await Promise.all([
        getApplications({ status, search: search.trim() }),
        getStats(),
        getNeedsAttention()
      ])
      setApplications(applicationData)
      setStats(statsData)
      setAttention(attentionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load applications.')
    } finally {
      setLoading(false)
    }
  }, [search, status, user])

  useEffect(() => {
    if (!user) return
    const timeout = window.setTimeout(() => {
      void loadData()
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [loadData, user])

  function handleAuthenticated(response: AuthResponse) {
    setAuthToken(response.token)
    setUser(response.user)
    setError(null)
  }

  function logout() {
    clearAuthToken()
    setUser(null)
    setApplications([])
    setStats(null)
    setAttention([])
    setEditing(null)
    setFormOpen(false)
    setSearch('')
    setStatus('')
  }

  function changeView(nextView: 'board' | 'table') {
    setView(nextView)
    window.localStorage.setItem('job-tracker-view', nextView)
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(application: JobApplication) {
    setEditing(application)
    setFormOpen(true)
  }

  async function handleSave(payload: JobApplicationPayload) {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await updateApplication(editing.id, payload)
      } else {
        await createApplication(payload)
      }
      setFormOpen(false)
      setEditing(null)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save application.')
    } finally {
      setSaving(false)
    }
  }

  async function handleFollowUpChange(application: JobApplication, nextFollowUpDate: string | null) {
    setError(null)
    try {
      await updateApplicationFollowUp(application.id, nextFollowUpDate)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update follow-up date.')
    }
  }

  async function handleStatusChange(application: JobApplication, nextStatus: ApplicationStatus) {
    const previous = applications
    setApplications((current) =>
      current.map((item) =>
        item.id === application.id ? { ...item, status: nextStatus } : item
      )
    )
    try {
      await updateApplicationStatus(application.id, nextStatus)
      if (status && status !== nextStatus) {
        await loadData()
      } else {
        const [nextStats, nextAttention] = await Promise.all([getStats(), getNeedsAttention()])
        setStats(nextStats)
        setAttention(nextAttention)
      }
    } catch (err) {
      setApplications(previous)
      setError(err instanceof Error ? err.message : 'Unable to update status.')
    }
  }

  async function handleDelete(application: JobApplication) {
    const confirmed = window.confirm(
      `Delete ${application.companyName} — ${application.roleTitle}? This cannot be undone.`
    )
    if (!confirmed) return

    try {
      await deleteApplication(application.id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete application.')
    }
  }

  if (!authReady) {
    return (
      <div className="session-loader">
        <strong>Developer Job Tracker</strong>
        <span>Restoring your session…</span>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Private workspace</span>
          <h1>Developer Job Tracker</h1>
          <p>Track applications, interviews, follow-ups, and offers in one place.</p>
        </div>
        <div className="topbar-account">
          <div className="account-copy">
            <strong>{user.displayName}</strong>
            <span>{user.email}</span>
          </div>
          <button className="button secondary" type="button" onClick={logout}>Sign out</button>
          <button className="button primary" type="button" onClick={openCreate}>
            + Add application
          </button>
        </div>
      </header>

      <main>
        <StatsGrid stats={stats} />

        <NeedsAttention
          applications={attention}
          loading={loading}
          onEdit={openEdit}
          onReschedule={handleFollowUpChange}
        />

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Pipeline</span>
              <h2>Applications</h2>
            </div>
            <div className="panel-actions">
              <div className="view-switcher" role="group" aria-label="Application view">
                <button
                  type="button"
                  className={view === 'board' ? 'active' : ''}
                  onClick={() => changeView('board')}
                >
                  Board
                </button>
                <button
                  type="button"
                  className={view === 'table' ? 'active' : ''}
                  onClick={() => changeView('table')}
                >
                  Table
                </button>
              </div>
              <span className="result-count">{applications.length} shown</span>
            </div>
          </div>

          <div className="toolbar">
            <label className="search-field">
              <span className="sr-only">Search applications</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company or role…"
              />
            </label>

            <label>
              <span className="sr-only">Filter by status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="">All statuses</option>
                {APPLICATION_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {statusLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            {(search || status) && (
              <button
                className="button secondary"
                type="button"
                onClick={() => {
                  setSearch('')
                  setStatus('')
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <strong>Something went wrong.</strong>
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}

          {view === 'board' ? (
            <KanbanBoard
              applications={applications}
              loading={loading}
              onEdit={openEdit}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <ApplicationTable
              applications={applications}
              loading={loading}
              onEdit={openEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
        </section>
      </main>

      {formOpen && (
        <ApplicationForm
          application={editing}
          saving={saving}
          onSubmit={handleSave}
          onCancel={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

export default App
