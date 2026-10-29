import { useState, type FormEvent } from 'react'
import { login, register } from '../api/auth'
import type { AuthResponse } from '../types'

type Mode = 'login' | 'register'

interface Props {
  onAuthenticated: (response: AuthResponse) => void
}

export function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    try {
      const response = mode === 'login'
        ? await login(email, password)
        : await register(displayName, email, password)
      onAuthenticated(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to authenticate.')
    } finally {
      setBusy(false)
    }
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode)
    setError(null)
  }

  return (
    <div className="auth-shell">
      <section className="auth-brand-panel">
        <div className="auth-brand-copy">
          <span className="eyebrow auth-eyebrow">Developer portfolio project</span>
          <h1>Turn job searching into a pipeline you can actually manage.</h1>
          <p>
            Track applications, interviews, recruiter follow-ups, offers, and deadlines from one
            secure workspace.
          </p>
          <div className="auth-feature-grid">
            <span>✓ Private per-user data</span>
            <span>✓ Kanban application pipeline</span>
            <span>✓ Follow-up reminders</span>
            <span>✓ Search and dashboard stats</span>
          </div>
        </div>
      </section>

      <main className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <span className="eyebrow">Developer Job Tracker</span>
            <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p>
              {mode === 'login'
                ? 'Sign in to open your application pipeline.'
                : 'Create a private workspace for your job search.'}
            </p>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Create account
            </button>
          </div>

          {mode === 'register' && (
            <label>
              <span>Name</span>
              <input
                autoComplete="name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Nicholas Cornes"
                maxLength={120}
                required
              />
            </label>
          )}

          <label>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'}
              minLength={mode === 'register' ? 8 : undefined}
              maxLength={72}
              required
            />
          </label>

          {error && <div className="auth-error" role="alert">{error}</div>}

          <button className="button primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>

          <p className="auth-security-note">
            Passwords are stored as BCrypt hashes. Authenticated API requests use signed JWT bearer tokens.
          </p>
        </form>
      </main>
    </div>
  )
}
