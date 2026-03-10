import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle'

const features = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
    title: 'Smart Food Logging',
    desc: 'Log meals in seconds. Search from thousands of foods or add your own custom entries.'
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>,
    title: 'Nutrition Analytics',
    desc: 'Visual charts for calories, macros and trends. See your progress over days and weeks.'
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    title: 'Daily Goals',
    desc: 'Set personalized calorie and macro goals based on your body metrics and objectives.'
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Secure by Design',
    desc: 'OTP-based email verification. Your health data stays private and protected.'
  }
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--bg-0)', color: 'var(--text-primary)' }}>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/photo.png" alt="CalorieTrack"
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            <span className="font-bold text-base tracking-tight">CalorieTrack</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <Link to="/signin"
              className="text-sm font-medium px-3 py-2 rounded-lg transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              Sign in
            </Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-4">Get started</Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setMenuOpen(o => !o)}
              style={{ color: 'var(--text-secondary)', padding: '6px' }}>
              {menuOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden px-4 pb-4 flex flex-col gap-2"
            style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-1)' }}>
            <Link to="/signin" onClick={() => setMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl text-sm font-medium"
              style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-3)' }}>
              Sign in
            </Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)}
              className="btn-primary text-sm py-3 text-center">
              Get started free
            </Link>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full blur-[100px] sm:blur-[120px]"
            style={{ backgroundColor: 'var(--brand-dim)' }} />
        </div>

        <div className={`relative max-w-3xl mx-auto text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6"
            style={{ backgroundColor: 'var(--brand-dim)', border: '1px solid var(--brand-dim-hover)', color: 'var(--brand-text)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: 'var(--brand)' }} />
            Free to use. No credit card required.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-5">
            Track what you eat.{' '}
            <span style={{ color: 'var(--brand-text)' }}>Reach your goals.</span>
          </h1>

          <p className="text-base sm:text-xl max-w-xl mx-auto leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}>
            The nutrition tracker built for people who want results. Log meals, track macros, and understand your body — all in one clean interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs sm:max-w-none mx-auto">
            <Link to="/signup" className="btn-primary text-base py-3.5 px-8 w-full sm:w-auto">
              Start tracking for free
            </Link>
            <Link to="/signin" className="btn-ghost text-base py-3.5 px-8 w-full sm:w-auto">
              Already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-20 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything you need to stay on track</h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Simple, powerful tools for your nutrition journey.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {features.map(f => (
              <div key={f.title} className="card-hover p-5 sm:p-6 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand-text)' }}>
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-1.5 text-sm sm:text-base">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to start?</h2>
          <p className="mb-8 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
            Create your free account and start tracking in under 2 minutes.
          </p>
          <Link to="/signup" className="btn-primary text-base py-3.5 px-10 inline-block w-full sm:w-auto">
            Create free account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-6 sm:py-8 px-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/photo.png" alt="CalorieTrack"
              style={{ width: '24px', height: '24px', borderRadius: '6px', objectFit: 'cover' }} />
            <span className="text-sm font-semibold">CalorieTrack</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>© 2024 CalorieTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}