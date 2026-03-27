import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { format } from 'date-fns'
import './DashboardPage.css'

const today = format(new Date(), 'yyyy-MM-dd')

function CircleProgress({ value, max, size = 120, strokeWidth = 10, color }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference * (1 - progress)
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color || '#2dd4bf'}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} className="progress-ring-circle" />
    </svg>
  )
}

function MacroBar({ label, value, goal, color, unit = 'g' }) {
  const pct = Math.min((value / goal) * 100, 100)
  return (
    <div className="macro-bar-wrapper">
      <div className="macro-bar-header">
        <span className="macro-label">{label}</span>
        <span className="macro-value">{Math.round(value)}{unit} / {goal}{unit}</span>
      </div>
      <div className="macro-bar-track">
        <div className="macro-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const goals = user?.profile || {}
  const calorieGoal = goals.dailyCalorieGoal || 2000
  const proteinGoal = goals.dailyProteinGoal || 150
  const carbGoal = goals.dailyCarbGoal || 250
  const fatGoal = goals.dailyFatGoal || 65

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get(`/log/${today}`)
      setData(res.data)
    } catch {
      setData({ totals: { calories: 0, protein: 0, carbs: 0, fat: 0, caloriesBurned: 0, netCalories: 0 }, allLogs: [], activityLogs: [] })
    } finally {
      setLoading(false)
    }
  }

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, caloriesBurned: 0, netCalories: 0 }
  const netCalories = totals.netCalories || 0
  const remaining = calorieGoal - netCalories
  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'

  if (loading) return (
    <div className="dashboard-loading">
      <div className="skeleton skeleton-title" />
      <div className="skeleton-grid">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  )

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">{greeting}, {firstName}</h1>
          <p className="dashboard-date">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/activity" className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Activity
          </Link>
          <Link to="/log" className="btn-primary log-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log food
          </Link>
        </div>
      </div>

      <div className="dashboard-top-grid">
        <div className="card calorie-card">
          <div className="circle-wrapper">
            <CircleProgress value={netCalories} max={calorieGoal} size={110} strokeWidth={9}
              color={netCalories > calorieGoal ? '#ef4444' : '#2dd4bf'} />
            <div className="circle-center">
              <span className="circle-number">{Math.round(netCalories)}</span>
              <span className="circle-label">net</span>
            </div>
          </div>
          <div className="calorie-info">
            <p className="calorie-info-label">Net Calories</p>
            <p className="calorie-remaining">{Math.round(remaining)}</p>
            <p className="calorie-sub">remaining of {calorieGoal}</p>
            {netCalories > calorieGoal && (
              <p className="over-goal">{Math.round(netCalories - calorieGoal)} over goal</p>
            )}
            {totals.caloriesBurned > 0 && (
              <div className="burned-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
                {Math.round(totals.caloriesBurned)} kcal burned
              </div>
            )}
          </div>
        </div>

        <div className="card macros-card">
          <p className="macros-title">Macros Today</p>
          <MacroBar label="Protein" value={totals.protein} goal={proteinGoal} color="#22c55e" />
          <MacroBar label="Carbs" value={totals.carbs} goal={carbGoal} color="#3b82f6" />
          <MacroBar label="Fat" value={totals.fat} goal={fatGoal} color="#f59e0b" />
        </div>
      </div>

      {totals.caloriesBurned > 0 && (
        <div className="card calorie-breakdown-card">
          <div className="breakdown-item">
            <span className="breakdown-label">Consumed</span>
            <span className="breakdown-value breakdown-consumed">{Math.round(totals.calories)} kcal</span>
          </div>
          <div className="breakdown-minus">−</div>
          <div className="breakdown-item">
            <span className="breakdown-label">Burned</span>
            <span className="breakdown-value breakdown-burned">{Math.round(totals.caloriesBurned)} kcal</span>
          </div>
          <div className="breakdown-equals">=</div>
          <div className="breakdown-item">
            <span className="breakdown-label">Net</span>
            <span className="breakdown-value breakdown-net">{Math.round(netCalories)} kcal</span>
          </div>
        </div>
      )}

      <div className="meal-grid">
        {[
          { label: 'Breakfast', meal: 'breakfast', color: '#f59e0b' },
          { label: 'Lunch', meal: 'lunch', color: '#3b82f6' },
          { label: 'Dinner', meal: 'dinner', color: '#8b5cf6' },
          { label: 'Snacks', meal: 'snack', color: '#22c55e' }
        ].map(({ label, meal, color }) => {
          const mealLogs = data?.logs?.[meal] || []
          const mealCals = mealLogs.reduce((s, l) => s + (l.nutrients?.calories || 0), 0)
          return (
            <Link key={meal} to="/log" className="card meal-card">
              <p className="meal-label">{label}</p>
              <p className="meal-cals" style={{ color }}>{Math.round(mealCals)}</p>
              <p className="meal-unit">kcal</p>
            </Link>
          )
        })}
      </div>

      {!user?.profile?.age && (
        <div className="card profile-banner">
          <div>
            <p className="profile-banner-title">Complete your profile</p>
            <p className="profile-banner-sub">Get personalized calorie and macro goals based on your body.</p>
          </div>
          <Link to="/profile" className="btn-primary setup-btn">Set up</Link>
        </div>
      )}
    </div>
  )
}