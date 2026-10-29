import { useEffect, useState, type FormEvent } from 'react'
import {
  APPLICATION_STATUSES,
  type JobApplication,
  type JobApplicationPayload
} from '../types'
import { statusLabel } from '../utils/format'

interface ApplicationFormProps {
  application?: JobApplication | null
  saving: boolean
  onSubmit: (payload: JobApplicationPayload) => Promise<void>
  onCancel: () => void
}

const emptyForm: JobApplicationPayload = {
  companyName: '',
  roleTitle: '',
  status: 'APPLIED',
  jobUrl: null,
  location: null,
  salaryMin: null,
  salaryMax: null,
  appliedDate: new Date().toISOString().slice(0, 10),
  nextFollowUpDate: null,
  contactName: null,
  contactEmail: null,
  notes: null
}

function fromApplication(application?: JobApplication | null): JobApplicationPayload {
  if (!application) return emptyForm
  return {
    companyName: application.companyName,
    roleTitle: application.roleTitle,
    status: application.status,
    jobUrl: application.jobUrl,
    location: application.location,
    salaryMin: application.salaryMin,
    salaryMax: application.salaryMax,
    appliedDate: application.appliedDate,
    nextFollowUpDate: application.nextFollowUpDate,
    contactName: application.contactName,
    contactEmail: application.contactEmail,
    notes: application.notes
  }
}

function nullable(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function ApplicationForm({
  application,
  saving,
  onSubmit,
  onCancel
}: ApplicationFormProps) {
  const [form, setForm] = useState<JobApplicationPayload>(() => fromApplication(application))

  useEffect(() => {
    setForm(fromApplication(application))
  }, [application])

  function setText(field: keyof JobApplicationPayload, value: string) {
    setForm((current) => ({ ...current, [field]: nullable(value) }))
  }

  function setNumber(field: 'salaryMin' | 'salaryMax', value: string) {
    setForm((current) => ({
      ...current,
      [field]: value === '' ? null : Number(value)
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.companyName.trim() || !form.roleTitle.trim()) return
    await onSubmit(form)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Application details</span>
            <h2 id="application-form-title">
              {application ? 'Edit application' : 'Add application'}
            </h2>
          </div>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close form">
            ×
          </button>
        </div>

        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-grid two-column">
            <label>
              Company <span aria-hidden="true">*</span>
              <input
                required
                maxLength={120}
                value={form.companyName}
                onChange={(event) => setForm({ ...form, companyName: event.target.value })}
                placeholder="OpenAI"
              />
            </label>

            <label>
              Role <span aria-hidden="true">*</span>
              <input
                required
                maxLength={120}
                value={form.roleTitle}
                onChange={(event) => setForm({ ...form, roleTitle: event.target.value })}
                placeholder="Software Engineer"
              />
            </label>

            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value as JobApplicationPayload['status'] })
                }
              >
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Location
              <input
                maxLength={160}
                value={form.location ?? ''}
                onChange={(event) => setText('location', event.target.value)}
                placeholder="Remote"
              />
            </label>

            <label>
              Applied date
              <input
                type="date"
                value={form.appliedDate ?? ''}
                onChange={(event) => setForm({ ...form, appliedDate: event.target.value || null })}
              />
            </label>

            <label>
              Next follow-up
              <input
                type="date"
                value={form.nextFollowUpDate ?? ''}
                onChange={(event) => setForm({ ...form, nextFollowUpDate: event.target.value || null })}
              />
            </label>

            <label>
              Minimum salary
              <input
                type="number"
                min="0"
                step="1000"
                value={form.salaryMin ?? ''}
                onChange={(event) => setNumber('salaryMin', event.target.value)}
                placeholder="95000"
              />
            </label>

            <label>
              Maximum salary
              <input
                type="number"
                min="0"
                step="1000"
                value={form.salaryMax ?? ''}
                onChange={(event) => setNumber('salaryMax', event.target.value)}
                placeholder="125000"
              />
            </label>

            <label>
              Contact name
              <input
                maxLength={120}
                value={form.contactName ?? ''}
                onChange={(event) => setText('contactName', event.target.value)}
                placeholder="Hiring manager"
              />
            </label>

            <label>
              Contact email
              <input
                type="email"
                maxLength={180}
                value={form.contactEmail ?? ''}
                onChange={(event) => setText('contactEmail', event.target.value)}
                placeholder="recruiter@example.com"
              />
            </label>
          </div>

          <label>
            Job posting URL
            <input
              type="url"
              maxLength={500}
              value={form.jobUrl ?? ''}
              onChange={(event) => setText('jobUrl', event.target.value)}
              placeholder="https://company.com/jobs/..."
            />
          </label>

          <label>
            Notes
            <textarea
              maxLength={4000}
              rows={5}
              value={form.notes ?? ''}
              onChange={(event) => setText('notes', event.target.value)}
              placeholder="Interview notes, tech stack, referral details..."
            />
          </label>

          <div className="modal-actions">
            <button className="button secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : application ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
