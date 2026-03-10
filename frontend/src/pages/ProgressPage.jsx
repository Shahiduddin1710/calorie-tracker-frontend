import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      backgroundColor: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: 'var(--shadow)', color: 'var(--text-primary)'
    }}>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ fontSize: '13px', fontWeight: 500, color: p.color, margin: '2px 0' }}>
          {p.name}: <strong style={{ fontFamily: 'monospace' }}>{Math.round(p.value)}</strong>
        </p>
      ))}
    </div>
  )
}

export default function ProgressPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(7)
  const calorieGoal = user?.profile?.dailyCalorieGoal || 2000
  const gridColor = theme === 'dark' ? '#1c1c21' : '#e2e8f0'
  const tickColor = theme === 'dark' ? '#64748b' : '#94a3b8'

  useEffect(() => { fetchStats() }, [range])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const startDate = format(subDays(new Date(), range - 1), 'yyyy-MM-dd')
      const res = await api.get(`/log/stats/weekly?startDate=${startDate}`)
      setStats(res.data.stats)
    } catch {} finally { setLoading(false) }
  }

  const chartData = Array.from({ length: range }, (_, i) => {
    const d = format(subDays(new Date(), range - 1 - i), 'yyyy-MM-dd')
    const label = format(subDays(new Date(), range - 1 - i), range <= 7 ? 'EEE' : 'MM/dd')
    const s = stats[d] || { calories: 0, protein: 0, carbs: 0, fat: 0 }
    return { date: label, Calories: Math.round(s.calories), Protein: Math.round(s.protein), Carbs: Math.round(s.carbs), Fat: Math.round(s.fat), Goal: calorieGoal }
  })

  const logged = chartData.filter(d => d.Calories > 0)
  const avgCalories = logged.length ? Math.round(logged.reduce((s, d) => s + d.Calories, 0) / logged.length) : 0
  const avgProtein  = logged.length ? Math.round(logged.reduce((s, d) => s + d.Protein,  0) / logged.length) : 0
  const daysOnTrack = chartData.filter(d => d.Calories > 0 && d.Calories <= calorieGoal * 1.05).length

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto" style={{ color: 'var(--text-primary)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Progress</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your nutrition trends</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-3)' }}>
          {[7, 14, 30].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: range === r ? 'var(--brand)' : 'transparent',
                color: range === r ? '#ffffff' : 'var(--text-muted)'
              }}>
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Avg Calories', value: `${avgCalories}`, sub: `Goal: ${calorieGoal}`, color: 'var(--text-primary)' },
          { label: 'Avg Protein',  value: `${avgProtein}g`, sub: 'per day',              color: '#22c55e' },
          { label: 'On Track',     value: `${daysOnTrack}/${logged.length}`, sub: 'days logged', color: 'var(--brand-text)' }
        ].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-xl font-bold calorie-number" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Calorie Intake</h2>
        {loading ? (
          <div className="h-52 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-3)' }} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
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

      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>Macros Breakdown</h2>
        {loading ? (
          <div className="h-52 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-3)' }} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="date" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
              <Bar dataKey="Protein" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Carbs"   fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Fat"     fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
