import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './LandingPage.css'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
    title: 'Smart Food Logging',
    desc: 'Log meals in seconds. Search from thousands of foods or add your own custom entries.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
      </svg>
    ),
    title: 'Nutrition Analytics',
    desc: 'Visual charts for calories, macros and trends. See your progress over days and weeks.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Daily Goals',
    desc: 'Set personalized calorie and macro goals based on your body metrics and objectives.'
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure by Design',
    desc: 'OTP-based email verification. Your health data stays private and protected.'
  }
]

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="landing-page">

      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <img src="/logo192.png" alt="CalorieTrack" className="landing-logo-img" />
            <span className="landing-brand">CalorieTrack</span>
          </div>

          <div className="landing-nav-desktop">
            <Link to="/signin" className="landing-signin-link">Sign in</Link>
            <Link to="/signup" className="btn-primary">Get started</Link>
          </div>

          <div className="landing-nav-mobile">
            <button onClick={() => setMenuOpen(o => !o)} className="hamburger-btn">
              {menuOpen
                ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" /></svg>
              }
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="landing-mobile-menu">
            <Link to="/signin" onClick={() => setMenuOpen(false)} className="mobile-signin-link">Sign in</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn-primary mobile-signup-btn">Get started free</Link>
          </div>
        )}
      </nav>

      <section className="hero-section">
        <div className="hero-glow" />
        <div className={`hero-content ${mounted ? 'hero-visible' : 'hero-hidden'}`}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Free to use. No credit card required.
          </div>
          <h1 className="hero-title">
            Track what you eat.{' '}
            <span className="hero-title-highlight">Reach your goals.</span>
          </h1>
          <p className="hero-desc">
            The nutrition tracker built for people who want results. Log meals, track macros, and understand your body — all in one clean interface.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn-primary hero-cta">Start tracking for free</Link>
            <Link to="/signin" className="btn-ghost hero-ghost">Already have an account</Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-inner">
          <div className="features-heading">
            <h2 className="features-title">Everything you need to stay on track</h2>
            <p className="features-sub">Simple, powerful tools for your nutrition journey.</p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Ready to start?</h2>
          <p className="cta-desc">Create your free account and start tracking in under 2 minutes.</p>
          <Link to="/signup" className="btn-primary cta-btn">Create free account</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            <img src="/logo192.png" alt="CalorieTrack" className="footer-logo-img" />
            <span className="footer-brand">CalorieTrack</span>
          </div>
          <p className="footer-copy">© 2026 CalorieTrack. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}