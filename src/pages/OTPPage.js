import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import './OTPPage.css'

export default function OTPPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const email = location.state?.email || ''
  const purpose = location.state?.purpose || 'verify'

  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [view, setView] = useState('otp')
  const [verifiedOtp, setVerifiedOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')

  useEffect(() => {
    if (!email) navigate('/signup')
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(p => p - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleOtpChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(val)
  }

  const handleVerify = async (code) => {
    if (!code || code.length !== 6) return toast.error('Enter the complete 6-digit OTP.')
    setLoading(true)
    try {
      if (purpose === 'verify') {
        const res = await api.post('/auth/verify-otp', { email, otp: code })
        login(res.data.token, res.data.user)
        toast.success('Email verified! Welcome to CalorieTrack.')
        navigate('/dashboard')
      } else {
        setVerifiedOtp(code)
        setView('reset')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    try {
      if (purpose === 'verify') {
        await api.post('/auth/resend-otp', { email })
      } else {
        await api.post('/auth/forgot-password', { email })
      }
      toast.success('New OTP sent to your email.')
      setResendTimer(60)
      setCanResend(false)
      setOtp('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetError('')
    if (!newPassword) return setResetError('Please enter a new password.')
    if (newPassword.length < 6) return setResetError('Password must be at least 6 characters.')
    if (newPassword !== confirmPassword) return setResetError('Passwords do not match.')
    setResetLoading(true)
    try {
      await api.post('/auth/reset-password', { email, otp: verifiedOtp, newPassword })
      toast.success('Password reset successfully! Please sign in.')
      navigate('/signin')
    } catch (err) {
      setResetError(err.response?.data?.message || 'Password reset failed. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="otp-page">

      <nav className="otp-nav">
        <Link to="/" className="otp-nav-logo">
          <img src="/logo192.png" alt="CalorieTrack" className="otp-nav-logo-img" />
          <span className="otp-nav-brand">CalorieTrack</span>
        </Link>
      </nav>

      <div className="otp-body">
        <div className="otp-card">

          {view === 'otp' && (
            <>
              <div className="otp-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              <p className="otp-eyebrow">EMAIL VERIFICATION</p>
              <h1 className="otp-title">Verify your email</h1>
              <p className="otp-desc">Enter the 6-digit code sent to your email</p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className="otp-single-input"
                placeholder="Enter 6-digit OTP"
                disabled={loading}
                autoFocus
              />

              <button
                onClick={() => handleVerify(otp)}
                disabled={loading || otp.length !== 6}
                className="btn-primary otp-verify-btn"
              >
                {loading ? (
                  <>
                    <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                    </svg>
                    Verifying...
                  </>
                ) : 'Verify'}
              </button>

              <div className="otp-resend-row">
                {canResend ? (
                  <button onClick={handleResend} className="otp-resend-btn">
                    Didn't receive code? <span className="otp-resend-link">Resend</span>
                  </button>
                ) : (
                  <p className="otp-resend-timer">
                    Didn't receive code? Resend in <span className="otp-timer-num">{resendTimer}s</span>
                  </p>
                )}
              </div>
            </>
          )}

          {view === 'reset' && (
            <>
              <div className="otp-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <h1 className="otp-title">Set new password</h1>
              <p className="otp-desc">Choose a strong password for your account</p>

              <form onSubmit={handleResetPassword} className="reset-form">
                <div className="reset-field">
                  <label className="reset-label">New password</label>
                  <div className="reset-input-wrap">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setResetError('') }}
                      className="reset-input"
                      placeholder="Min. 6 characters"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowNewPass(p => !p)} className="eye-btn">
                      {showNewPass
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                </div>

                <div className="reset-field">
                  <label className="reset-label">Confirm password</label>
                  <div className="reset-input-wrap">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setResetError('') }}
                      className="reset-input"
                      placeholder="Repeat your password"
                    />
                    <button type="button" onClick={() => setShowConfirmPass(p => !p)} className="eye-btn">
                      {showConfirmPass
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div className="reset-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{resetError}</span>
                  </div>
                )}

                <button type="submit" disabled={resetLoading} className="btn-primary otp-verify-btn">
                  {resetLoading ? (
                    <>
                      <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                      </svg>
                      Resetting...
                    </>
                  ) : 'Reset password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}