import './LoadingScreen.css'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-inner">
        <div className="loading-logo-wrap">
          <div className="loading-logo-bg">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M18 4C10.268 4 4 10.268 4 18s6.268 14 14 14 14-6.268 14-14S25.732 4 18 4z"
                stroke="#2dd4bf" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M12 18c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6"
                stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" />
              <circle cx="18" cy="18" r="3" fill="#2dd4bf" />
            </svg>
          </div>
          <div className="loading-ring" />
        </div>
        <div className="loading-text">
          <h1 className="loading-title">CalorieTrack</h1>
          <p className="loading-sub">Loading your nutrition data...</p>
        </div>
        <div className="loading-bar-container">
          <div className="loading-bar-fill" />
        </div>
      </div>
    </div>
  )
}
