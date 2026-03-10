export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--brand-dim)' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z"
                stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="4 2"/>
              <path d="M12 18c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6"
                stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="18" cy="18" r="3" fill="var(--brand)"/>
            </svg>
          </div>
          <div className="loading-logo-ring absolute inset-0" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>CalorieTrack</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Loading your nutrition data...</p>
        </div>
        <div className="loading-bar-container">
          <div className="loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}
