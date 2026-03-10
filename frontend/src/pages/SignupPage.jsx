import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import ThemeToggle from '../components/ThemeToggle'

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
    if (!form.name.trim())   return setFieldError('Please enter your full name.')
    if (!form.email.trim())  return setFieldError('Please enter your email address.')
    if (!form.password)      return setFieldError('Please enter a password.')
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Create your account</h1>
            <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Start tracking your nutrition for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className="input-field" placeholder="Shahid Shaikh" autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                className="input-field" placeholder="shahid@example.com" autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  className="input-field pr-12" placeholder="Min 6 characters" autoComplete="new-password" />
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
                  {fieldError.includes('Try signing in') && (
                    <span> <Link to="/signin" className="font-semibold underline" style={{ color: 'var(--brand-text)' }}>Sign in here</Link></span>
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
                    Creating account...
                  </>
                ) : 'Create account'}
              </button>
            </div>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/signin" className="font-medium" style={{ color: 'var(--brand-text)' }}>Sign in</Link>
          </p>
          <p className="text-xs text-center mt-4 leading-relaxed" style={{ color: 'var(--text-faint)' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}