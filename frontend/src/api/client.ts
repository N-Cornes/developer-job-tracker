import type { ApiError } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const TOKEN_KEY = 'developer-job-tracker-token'

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken()
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers
    },
    ...options
  })

  if (!response.ok) {
    let error: ApiError = {}
    try {
      error = (await response.json()) as ApiError
    } catch {
      // Fall back to a generic error below.
    }

    if (response.status === 401 && token && !path.startsWith('/auth/')) {
      clearAuthToken()
      window.dispatchEvent(new CustomEvent('job-tracker-auth-expired'))
    }

    const fieldErrors = error.fieldErrors ?? error.errors
    const details = fieldErrors
      ? Object.entries(fieldErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ')
      : null

    throw new Error(details ?? error.message ?? `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
