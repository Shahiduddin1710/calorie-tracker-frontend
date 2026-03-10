import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function SigninPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [view, setView] = useState('signin')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (fieldError) setFieldError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError('')
    if (!form.email.trim()) return setFieldError('Please enter your email address.')
    if (!form.password) return setFieldError('Please enter your password.')

    setLoading(true)
    try {
      const res = await api.post('/auth/signin', form)
      login(res.data.token, res.data.user)
      toast.success('Welcome back, ' + res.data.user.name.split(' ')[0] + '!')
      navigate('/dashboard')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''

      if (err.response?.data?.needsVerification) {
        toast.error('Please verify your email first.')
        navigate('/verify', { state: { email: form.email, purpose: 'verify' } })
        return
      }
      if (!err.response || status === 0) {
        setFieldError('Cannot connect to server. Please make sure the backend is running.')
      } else if (status === 401) {
        setFieldError('Invalid email or password. Please check your credentials and try again.')
      } else if (status === 404 || msg.toLowerCase().includes('not found')) {
        setFieldError('No account found with this email.')
      } else {
        setFieldError(msg || 'Sign in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    setForgotError('')
    if (!forgotEmail.trim()) return setForgotError('Please enter your email address.')

    setForgotLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      toast.success('OTP sent! Check your email.')
      navigate('/verify', { state: { email: forgotEmail, purpose: 'reset' } })
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-0)' }}>
      <nav className="h-16 flex items-center justify-between px-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link to="/" className="flex items-center gap-2">
          <img src="/photo.png" alt="CalorieTrack" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} />
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>CalorieTrack</span>
        </Link>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade-in">

          {view === 'signin' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back</h1>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Sign in to continue tracking</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className="input-field" placeholder="shahid@example.com" autoComplete="email" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
                    <button type="button" onClick={() => { setView('forgot'); setForgotEmail(form.email); setForgotError('') }}
                      className="text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: 'var(--brand-text)' }}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} className="input-field pr-12" placeholder="Your password" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                      {showPass ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {fieldError && (
                  <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
                    style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>
                      {fieldError}
                      {fieldError.includes('No account found') && (
                        <span> <Link to="/signup" className="font-semibold underline" style={{ color: 'var(--brand-text)' }}>Sign up here</Link></span>
                      )}
                    </span>
                  </div>
                )}

                <div className="pt-1">
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Signing in...
                      </>
                    ) : 'Sign in'}
                  </button>
                </div>
              </form>

              <p className="text-sm text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium" style={{ color: 'var(--brand-text)' }}>
                  Create one for free
                </Link>
              </p>
            </>
          )}

          {view === 'forgot' && (
            <>
              <button type="button" onClick={() => { setView('signin'); setForgotError('') }}
                className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to sign in
              </button>

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--brand-dim)', border: '1px solid var(--brand-dim-hover)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Forgot password?</h1>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Enter your email and we'll send you a reset OTP</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                  <input type="email" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setForgotError('') }}
                    className="input-field" placeholder="shahid@example.com" autoComplete="email" autoFocus />
                </div>

                {forgotError && (
                  <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
                    style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="pt-1">
                  <button type="submit" disabled={forgotLoading}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                    {forgotLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending OTP...
                      </>
                    ) : 'Send reset OTP'}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}