import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import './SignupPage.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (fieldError) setFieldError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError('')
    if (!form.name.trim()) return setFieldError('Please enter your full name.')
    if (!form.email.trim()) return setFieldError('Please enter your email address.')
    if (!form.password) return setFieldError('Please enter a password.')
    if (form.password.length < 6) return setFieldError('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await api.post('/auth/signup', form)
      toast.success('Account created! Check your email for the OTP.')
      navigate('/verify', { state: { email: form.email, purpose: 'verify' } })
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message || ''
      if (!err.response || status === 0) {
        setFieldError('Cannot connect to server. Please make sure the backend is running.')
      } else if (status === 409) {
        setFieldError('An account with this email already exists. Try signing in instead.')
      } else {
        setFieldError(msg || 'Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="signup-page">
      <nav className="auth-nav">
        <Link to="/" className="auth-nav-logo">
          <img src="/logo192.png" alt="CalorieTrack" className="auth-nav-logo-img" />
          <span className="auth-nav-brand">CalorieTrack</span>
        </Link>
      </nav>

      <div className="auth-body">
        <div className="auth-card">
          <div className="auth-heading">
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start tracking your nutrition for free</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="input-field" placeholder="Your full name" autoComplete="name" />
            </div>
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="you@example.com" autoComplete="email" />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="password-wrap">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} className="input-field" style={{ paddingRight: '44px' }}
                  placeholder="Min 6 characters" autoComplete="new-password" />
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
                  {fieldError.includes('Try signing in') && (
                    <> <Link to="/signin" className="auth-error-link">Sign in here</Link></>
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
                  Creating account...
                </>
              ) : 'Create account'}
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/signin" className="auth-footer-link">Sign in</Link>
          </p>
          <p className="auth-terms">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
