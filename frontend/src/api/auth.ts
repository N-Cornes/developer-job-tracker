import type { AuthResponse, AuthUser } from '../types'
import { apiRequest } from './client'

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export function register(displayName: string, email: string, password: string) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ displayName, email, password })
  })
}

export function getCurrentUser() {
  return apiRequest<AuthUser>('/auth/me')
}
