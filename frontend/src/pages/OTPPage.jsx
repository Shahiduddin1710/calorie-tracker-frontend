import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function OTPPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const email = location.state?.email || ''
  const purpose = location.state?.purpose || 'verify'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
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
  const inputs = useRef([])

  useEffect(() => {
    if (!email) navigate('/signup')
    else inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(p => p - 1), 1000)
      return () => clearTimeout(t)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const newOtp = [...otp]
    newOtp[idx] = val.slice(-1)
    setOtp(newOtp)
    if (val && idx < 5) inputs.current[idx + 1]?.focus()
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) handleVerify(newOtp.join(''))
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus()
    if (e.key === 'ArrowLeft' && idx > 0) inputs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < 5) inputs.current[idx + 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const arr = pasted.split('')
      setOtp(arr)
      inputs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (code) => {
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
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
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
      setOtp(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
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

          {view === 'otp' && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--brand-dim)', border: '1px solid var(--brand-dim-hover)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>

              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Check your email</h1>
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                {purpose === 'reset' ? 'We sent a password reset code to' : 'We sent a 6-digit code to'}
              </p>
              <p className="text-sm font-medium mb-8" style={{ color: 'var(--text-primary)' }}>{email}</p>

              <div className="flex gap-2.5 mb-6" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input key={idx} ref={el => inputs.current[idx] = el} type="text" inputMode="numeric" maxLength={1}
                    value={digit} onChange={e => handleChange(idx, e.target.value)} onKeyDown={e => handleKeyDown(idx, e)}
                    className={`otp-input ${digit ? 'filled' : ''}`} disabled={loading} />
                ))}
              </div>

              <button onClick={() => { const code = otp.join(''); if (code.length !== 6) return toast.error('Enter the complete 6-digit OTP.'); handleVerify(code) }}
                disabled={loading || otp.join('').length !== 6}
                className="btn-primary w-full text-sm flex items-center justify-center gap-2 mb-4">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Verifying...
                  </>
                ) : purpose === 'reset' ? 'Verify OTP' : 'Verify email'}
              </button>

              <div className="text-center mb-4">
                {canResend ? (
                  <button onClick={handleResend} className="text-sm font-medium" style={{ color: 'var(--brand-text)' }}>Resend OTP</button>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Resend in <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{resendTimer}s</span>
                  </p>
                )}
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Didn't get the email? Check your spam folder. The code expires in 10 minutes.
                </p>
              </div>
            </>
          )}

          {view === 'reset' && (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--brand-dim)', border: '1px solid var(--brand-dim-hover)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Set new password</h1>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>Choose a strong password for your account</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New password</label>
                  <div className="relative">
                    <input type={showNewPass ? 'text' : 'password'} value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setResetError('') }}
                      className="input-field pr-12" placeholder="Min. 6 characters" autoFocus />
                    <button type="button" onClick={() => setShowNewPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                      {showNewPass ? (
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

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm password</label>
                  <div className="relative">
                    <input type={showConfirmPass ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setResetError('') }}
                      className="input-field pr-12" placeholder="Repeat your password" />
                    <button type="button" onClick={() => setShowConfirmPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                      {showConfirmPass ? (
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

                {resetError && (
                  <div className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
                    style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{resetError}</span>
                  </div>
                )}

                <div className="pt-1">
                  <button type="submit" disabled={resetLoading}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                    {resetLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Resetting...
                      </>
                    ) : 'Reset password'}
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