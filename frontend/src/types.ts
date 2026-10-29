export const APPLICATION_STATUSES = [
  'WISHLIST',
  'APPLIED',
  'PHONE_SCREEN',
  'INTERVIEW',
  'TECHNICAL_INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN'
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export interface JobApplication {
  id: number
  companyName: string
  roleTitle: string
  status: ApplicationStatus
  jobUrl: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  appliedDate: string | null
  nextFollowUpDate: string | null
  contactName: string | null
  contactEmail: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface JobApplicationPayload {
  companyName: string
  roleTitle: string
  status: ApplicationStatus
  jobUrl: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  appliedDate: string | null
  nextFollowUpDate: string | null
  contactName: string | null
  contactEmail: string | null
  notes: string | null
}

export interface ApplicationStats {
  total: number
  byStatus: Record<string, number>
}

export interface AuthUser {
  id: number
  email: string
  displayName: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresAt: string
  user: AuthUser
}

export interface ApiError {
  status?: number
  message?: string
  fieldErrors?: Record<string, string>
  errors?: Record<string, string>
}
