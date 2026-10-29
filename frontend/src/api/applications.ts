import type {
  ApplicationStats,
  ApplicationStatus,
  JobApplication,
  JobApplicationPayload
} from '../types'
import { apiRequest } from './client'

export async function getApplications(filters?: { status?: string; search?: string }) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.search) params.set('search', filters.search)
  const suffix = params.size ? `?${params.toString()}` : ''
  return apiRequest<JobApplication[]>(`/applications${suffix}`)
}

export function getStats() {
  return apiRequest<ApplicationStats>('/applications/stats')
}

export function getNeedsAttention() {
  return apiRequest<JobApplication[]>('/applications/attention')
}

export function createApplication(payload: JobApplicationPayload) {
  return apiRequest<JobApplication>('/applications', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

export function updateApplication(id: number, payload: JobApplicationPayload) {
  return apiRequest<JobApplication>(`/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
}

export function updateApplicationFollowUp(id: number, nextFollowUpDate: string | null) {
  return apiRequest<JobApplication>(`/applications/${id}/follow-up`, {
    method: 'PATCH',
    body: JSON.stringify({ nextFollowUpDate })
  })
}

export function updateApplicationStatus(id: number, status: ApplicationStatus) {
  return apiRequest<JobApplication>(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
}

export function deleteApplication(id: number) {
  return apiRequest<void>(`/applications/${id}`, { method: 'DELETE' })
}
