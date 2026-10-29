import type { ApplicationStats } from '../types'
import { statusLabel } from '../utils/format'

interface StatsGridProps {
  stats: ApplicationStats | null
}

const summaryStatuses = ['APPLIED', 'INTERVIEW', 'TECHNICAL_INTERVIEW', 'OFFER']

export function StatsGrid({ stats }: StatsGridProps) {
  const cards = [
    { label: 'Total Applications', value: stats?.total ?? 0 },
    ...summaryStatuses.map((status) => ({
      label: statusLabel(status),
      value: stats?.byStatus?.[status] ?? 0
    }))
  ]

  return (
    <section className="stats-grid" aria-label="Application statistics">
      {cards.map((card) => (
        <article className="stat-card" key={card.label}>
          <span className="stat-label">{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  )
}
