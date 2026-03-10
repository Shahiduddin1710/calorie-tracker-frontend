import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { format } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')

function CircleProgress({ value, max, size = 120, strokeWidth = 10, color }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference * (1 - progress)
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-3)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color || 'var(--brand)'}
        strokeWidth={strokeWidth} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} className="progress-ring-circle" />
    </svg>
  )
}

function MacroBar({ label, value, goal, color, unit = 'g' }) {
  const pct = Math.min((value / goal) * 100, 100)
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{Math.round(value)}{unit} / {goal}{unit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-4)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
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
    try { const res = await api.get(`/log/${today}`); setData(res.data) }
    catch { setData({ totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }, allLogs: [] }) }
    finally { setLoading(false) }
  }

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const remaining = Math.max(calorieGoal - totals.calories, 0)
  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'

  if (loading) return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-8 rounded-lg w-64" style={{ backgroundColor: 'var(--bg-3)' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2].map(i => <div key={i} className="h-44 rounded-2xl" style={{ backgroundColor: 'var(--bg-3)' }} />)}
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{greeting}, {firstName}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <Link to="/log" className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Log food
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-6 flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <CircleProgress value={totals.calories} max={calorieGoal} size={110} strokeWidth={9}
              color={totals.calories > calorieGoal ? '#ef4444' : 'var(--brand)'} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold calorie-number" style={{ color: 'var(--text-primary)' }}>{Math.round(totals.calories)}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>eaten</span>
            </div>
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Daily Calories</p>
            <p className="text-3xl font-bold calorie-number" style={{ color: 'var(--text-primary)' }}>{Math.round(remaining)}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>remaining of {calorieGoal}</p>
            {totals.calories > calorieGoal && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger-text)' }}>
                {Math.round(totals.calories - calorieGoal)} over goal
              </p>
            )}
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Macros Today</p>
          <MacroBar label="Protein" value={totals.protein} goal={proteinGoal} color="#22c55e" />
          <MacroBar label="Carbs"   value={totals.carbs}   goal={carbGoal}    color="#3b82f6" />
          <MacroBar label="Fat"     value={totals.fat}     goal={fatGoal}     color="#f59e0b" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Breakfast', meal: 'breakfast', color: '#f59e0b' },
          { label: 'Lunch',     meal: 'lunch',     color: '#3b82f6' },
          { label: 'Dinner',    meal: 'dinner',    color: '#8b5cf6' },
          { label: 'Snacks',    meal: 'snack',     color: '#22c55e' }
        ].map(({ label, meal, color }) => {
          const mealLogs = data?.logs?.[meal] || []
          const mealCals = mealLogs.reduce((s, l) => s + (l.nutrients?.calories || 0), 0)
          return (
            <Link key={meal} to="/log" className="card-hover p-4 block">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
              <p className="text-lg font-bold calorie-number" style={{ color }}>{Math.round(mealCals)}</p>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>kcal</p>
            </Link>
          )
        })}
      </div>

      {!user?.profile?.age && (
        <div className="card p-4 flex items-center justify-between" style={{ borderColor: 'var(--brand)', backgroundColor: 'var(--brand-dim)' }}>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Complete your profile</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Get personalized calorie and macro goals based on your body.</p>
          </div>
          <Link to="/profile" className="btn-primary text-xs py-2 px-4 flex-shrink-0">Set up</Link>
        </div>
      )}
    </div>
  )
}
