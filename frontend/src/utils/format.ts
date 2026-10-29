import type { ApplicationStatus } from '../types'

export function statusLabel(status: ApplicationStatus | string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatMoney(value: number | null) {
  if (value === null || value === undefined) return null
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

export function salaryRange(min: number | null, max: number | null) {
  const left = formatMoney(min)
  const right = formatMoney(max)
  if (left && right) return `${left} – ${right}`
  return left ?? right ?? 'Not listed'
}

export function formatDate(value: string | null) {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(year, month - 1, day))
}

export function isOverdue(value: string | null) {
  if (!value) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day) < today
}
