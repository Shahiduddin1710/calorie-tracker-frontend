import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import './ProgressPage.css'

const gridColor = '#e5e7eb'
const tickColor = '#9ca3af'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="chart-tooltip-item" style={{ color: p.color }}>
          {p.name}: <strong>{Math.round(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(7)
  const calorieGoal = user?.profile?.dailyCalorieGoal || 2000

  useEffect(() => { fetchStats() }, [range])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const startDate = format(subDays(new Date(), range - 1), 'yyyy-MM-dd')
      const res = await api.get(`/log/stats/weekly?startDate=${startDate}`)
      setStats(res.data.stats)
    } catch {} finally {
      setLoading(false)
    }
  }

  const chartData = Array.from({ length: range }, (_, i) => {
    const d = format(subDays(new Date(), range - 1 - i), 'yyyy-MM-dd')
    const label = format(subDays(new Date(), range - 1 - i), range <= 7 ? 'EEE' : 'MM/dd')
    const s = stats[d] || { calories: 0, protein: 0, carbs: 0, fat: 0 }
    return {
      date: label,
      Calories: Math.round(s.calories),
      Protein: Math.round(s.protein),
      Carbs: Math.round(s.carbs),
      Fat: Math.round(s.fat),
      Goal: calorieGoal
    }
  })

  const logged = chartData.filter(d => d.Calories > 0)
  const avgCalories = logged.length ? Math.round(logged.reduce((s, d) => s + d.Calories, 0) / logged.length) : 0
  const avgProtein = logged.length ? Math.round(logged.reduce((s, d) => s + d.Protein, 0) / logged.length) : 0
  const daysOnTrack = chartData.filter(d => d.Calories > 0 && d.Calories <= calorieGoal * 1.05).length

  return (
    <div className="progress-container">
      <div className="progress-header">
        <div>
          <h1 className="progress-title">Progress</h1>
          <p className="progress-sub">Your nutrition trends</p>
        </div>
        <div className="range-tabs">
          {[7, 14, 30].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`range-btn ${range === r ? 'range-btn-active' : 'range-btn-inactive'}`}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Avg Calories', value: `${avgCalories}`, sub: `Goal: ${calorieGoal}`, color: '#111827' },
          { label: 'Avg Protein', value: `${avgProtein}g`, sub: 'per day', color: '#22c55e' },
          { label: 'On Track', value: `${daysOnTrack}/${logged.length}`, sub: 'days logged', color: '#0d9488' }
        ].map(stat => (
          <div key={stat.label} className="card stat-card">
            <p className="stat-value" style={{ color: stat.color }}>{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-sub">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="card chart-card">
        <h2 className="chart-title">Calorie Intake</h2>
        {loading ? (
          <div className="skeleton chart-skeleton" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Calories" stroke="#22c55e" strokeWidth={2} fill="url(#calGrad)" dot={{ fill: '#22c55e', r: 3 }} />
              <Area type="monotone" dataKey="Goal" stroke={tickColor} strokeWidth={1} strokeDasharray="4 4" fill="none" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card chart-card">
        <h2 className="chart-title">Macros Breakdown</h2>
        {loading ? (
          <div className="skeleton chart-skeleton" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} />
              <Bar dataKey="Protein" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Carbs" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Fat" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
