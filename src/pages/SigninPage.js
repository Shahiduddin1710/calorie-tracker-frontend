import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import './SigninPage.css'

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
    <div className="signin-page">
      <nav className="auth-nav">
        <Link to="/" className="auth-nav-logo">
          <img src="/logo192.png" alt="CalorieTrack" className="auth-nav-logo-img" />
          <span className="auth-nav-brand">CalorieTrack</span>
        </Link>
      </nav>

      <div className="auth-body">
        <div className="auth-card">

          {view === 'signin' && (
            <>
              <div className="auth-heading">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to continue tracking</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Email address</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange}
                    className="input-field" placeholder="you@example.com" autoComplete="email" />
                </div>

                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label">Password</label>
                    <button type="button" className="forgot-link"
                      onClick={() => { setView('forgot'); setForgotEmail(form.email); setForgotError('') }}>
                      Forgot password?
                    </button>
                  </div>
                  <div className="password-wrap">
                    <input type={showPass ? 'text' : 'password'} name="password" value={form.password}
                      onChange={handleChange} className="input-field" style={{ paddingRight: '44px' }}
                      placeholder="Your password" autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPass(p => !p)} className="password-eye-btn">
                      {showPass
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                </div>

                {fieldError && (
                  <div className="auth-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>
                      {fieldError}
                      {fieldError.includes('No account found') && (
                        <> <Link to="/signup" className="auth-error-link">Sign up here</Link></>
                      )}
                    </span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
                  {loading ? (
                    <>
                      <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                      </svg>
                      Signing in...
                    </>
                  ) : 'Sign in'}
                </button>
              </form>

              <p className="auth-footer-text">
                Don't have an account?{' '}
                <Link to="/signup" className="auth-footer-link">Create one for free</Link>
              </p>
            </>
          )}

          {view === 'forgot' && (
            <>
              <button type="button" onClick={() => { setView('signin'); setForgotError('') }} className="back-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to sign in
              </button>

              <div className="forgot-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <div className="auth-heading">
                <h1 className="auth-title">Forgot password?</h1>
                <p className="auth-subtitle">Enter your email and we'll send you a reset OTP</p>
              </div>

              <form onSubmit={handleForgotSubmit} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Email address</label>
                  <input type="email" value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); setForgotError('') }}
                    className="input-field" placeholder="you@example.com" autoFocus />
                </div>

                {forgotError && (
                  <div className="auth-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{forgotError}</span>
                  </div>
                )}

                <button type="submit" disabled={forgotLoading} className="btn-primary auth-submit-btn">
                  {forgotLoading ? (
                    <>
                      <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                      </svg>
                      Sending OTP...
                    </>
                  ) : 'Send reset OTP'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
