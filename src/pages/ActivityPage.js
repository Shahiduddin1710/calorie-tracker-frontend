import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import './ActivityPage.css'

const today = format(new Date(), 'yyyy-MM-dd')

const ACTIVITY_OPTIONS = [
  { value: 'running', label: 'Running', unit: 'time', rate: '10 kcal/min' },
  { value: 'walking', label: 'Walking', unit: 'time', rate: '5 kcal/min' },
  { value: 'cardio', label: 'Cardio', unit: 'time', rate: '8 kcal/min' },
  { value: 'swimming', label: 'Swimming', unit: 'both', rate: '7 kcal/min or 300 kcal/km' },
  { value: 'cycling', label: 'Cycling', unit: 'both', rate: '6 kcal/min or 40 kcal/km' },
  { value: 'custom', label: 'Custom', unit: 'time', rate: '5 kcal/min' }
]

const ACTIVITY_COLORS = {
  running: '#ef4444',
  walking: '#22c55e',
  cardio: '#f59e0b',
  swimming: '#3b82f6',
  cycling: '#8b5cf6',
  custom: '#2dd4bf'
}

const ActivityIcon = ({ type, size = 18 }) => {
  const s = { width: size, height: size, display: 'block' }
  if (type === 'running') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="1.5" />
      <path d="M7 21l3-6 3 3 2-4 3 2" />
      <path d="M10 10l1 4-4 1" />
      <path d="M13 10l3-2 2 2" />
    </svg>
  )
  if (type === 'walking') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="1.5" />
      <path d="M9 21l1.5-5L9 13l3-3 2 2 3-1" />
      <path d="M7 13l2-1" />
      <path d="M14.5 21l-1-4" />
    </svg>
  )
  if (type === 'cardio') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h4l2-7 3 14 2-9 2 4h5" />
    </svg>
  )
  if (type === 'swimming') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <path d="M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      <circle cx="12" cy="6" r="1.5" />
      <path d="M12 7.5l3 2-3 1.5" />
    </svg>
  )
  if (type === 'cycling') return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="15" r="3" />
      <circle cx="18" cy="15" r="3" />
      <path d="M6 15l4-6h4l2 6" />
      <path d="M10 9l2-4" />
      <circle cx="14" cy="4.5" r="1" />
    </svg>
  )
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export default function ActivityPage() {
  const [date, setDate] = useState(today)
  const [logs, setLogs] = useState([])
  const [totalBurned, setTotalBurned] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    activityType: 'running',
    customName: '',
    duration: '',
    distance: ''
  })

  useEffect(() => { fetchLogs() }, [date])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/activity/date/${date}`)
      setLogs(res.data.logs)
      setTotalBurned(res.data.totalBurned)
    } catch {
      setLogs([])
      setTotalBurned(0)
    } finally {
      setLoading(false)
    }
  }

  const selectedActivity = ACTIVITY_OPTIONS.find(a => a.value === form.activityType)
 const showDistance = ['running', 'walking', 'cardio', 'swimming', 'cycling'].includes(form.activityType)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.duration || Number(form.duration) < 1) {
      toast.error('Please enter a valid duration.')
      return
    }
    if (form.activityType === 'custom' && !form.customName.trim()) {
      toast.error('Please enter a name for your custom activity.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/activity', {
        activityType: form.activityType,
        customName: form.customName,
        duration: Number(form.duration),
        distance: form.distance ? Number(form.distance) : null,
        date
      })
      toast.success('Activity logged!')
      setForm({ activityType: 'running', customName: '', duration: '', distance: '' })
      setShowForm(false)
      fetchLogs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log activity.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/activity/${id}`)
      toast.success('Activity removed.')
      fetchLogs()
    } catch {
      toast.error('Failed to delete activity.')
    } finally {
      setDeletingId(null)
    }
  }

  const getActivityLabel = (log) => {
    if (log.activityType === 'custom' && log.customName) return log.customName
    return ACTIVITY_OPTIONS.find(a => a.value === log.activityType)?.label || log.activityType
  }

  return (
    <div className="activity-container">
      <div className="activity-header">
        <div>
          <h1 className="activity-title">Activity</h1>
          <p className="activity-sub">Track your workouts & calories burned</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Log Activity
            </>
          )}
        </button>
      </div>

      <div className="activity-date-row">
        <input
          type="date"
          value={date}
          max={today}
          onChange={e => setDate(e.target.value)}
          className="activity-date-input"
        />
      </div>

      {showForm && (
        <div className="card activity-form-card">
          <h2 className="form-section-title">Log New Activity</h2>
          <form onSubmit={handleSubmit} className="activity-form">
            <div className="activity-type-grid">
              {ACTIVITY_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm(f => ({ ...f, activityType: opt.value, distance: '' }))}
                  className={`activity-type-btn ${form.activityType === opt.value ? 'activity-type-btn-active' : ''}`}
                  style={form.activityType === opt.value ? { borderColor: ACTIVITY_COLORS[opt.value], backgroundColor: ACTIVITY_COLORS[opt.value] + '15' } : {}}
                >
                  <span
                    className="activity-type-icon"
                    style={form.activityType === opt.value ? { color: ACTIVITY_COLORS[opt.value] } : {}}
                  >
                    <ActivityIcon type={opt.value} size={20} />
                  </span>
                  <span className="activity-type-label">{opt.label}</span>
                  <span className="activity-type-rate">{opt.rate}</span>
                </button>
              ))}
            </div>

            {form.activityType === 'custom' && (
              <div className="form-group">
                <label className="form-label">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Yoga, HIIT, etc."
                  value={form.customName}
                  onChange={e => setForm(f => ({ ...f, customName: e.target.value }))}
                  className="form-input"
                  maxLength={50}
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input
                  type="number"
                  placeholder="e.g. 30"
                  value={form.duration}
                  min="1"
                  max="600"
                  onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  className="form-input"
                  required
                />
              </div>

              {showDistance && (
                <div className="form-group">
                  <label className="form-label">Distance (km) <span className="form-label-optional">optional</span></label>
                  <input
                    type="number"
                    placeholder="e.g. 2.5"
                    value={form.distance}
                    min="0"
                    step="0.1"
                    onChange={e => setForm(f => ({ ...f, distance: e.target.value }))}
                    className="form-input"
                  />
                </div>
              )}
            </div>

            {form.duration && Number(form.duration) > 0 && (
              <div className="calorie-preview">
                <span className="calorie-preview-label">Estimated calories burned</span>
                <span className="calorie-preview-value">
                  ~{estimateCalories(form.activityType, Number(form.duration), form.distance ? Number(form.distance) : null)} kcal
                </span>
              </div>
            )}

            <button type="submit" className="btn-primary btn-full" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Activity'}
            </button>
          </form>
        </div>
      )}

      <div className="card activity-summary-card">
        <div className="summary-row">
          <div className="summary-item">
            <p className="summary-value summary-burned">{Math.round(totalBurned)}</p>
            <p className="summary-label">kcal burned today</p>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <p className="summary-value">{logs.length}</p>
            <p className="summary-label">activities logged</p>
          </div>
          <div className="summary-divider" />
          <div className="summary-item">
            <p className="summary-value">{logs.reduce((s, l) => s + l.duration, 0)}</p>
            <p className="summary-label">total minutes</p>
          </div>
        </div>
      </div>

      <div className="activity-log-section">
        <h2 className="log-section-title">Activities on {format(new Date(date + 'T00:00:00'), 'MMM d, yyyy')}</h2>

        {loading ? (
          <div className="activity-skeleton-list">
            {[1, 2].map(i => <div key={i} className="skeleton activity-skeleton-item" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="activity-empty">
            <div className="activity-empty-icon">
              <ActivityIcon type="running" size={32} />
            </div>
            <p className="activity-empty-text">No activities logged for this day.</p>
            <button className="btn-ghost" onClick={() => setShowForm(true)}>Log your first activity</button>
          </div>
        ) : (
          <div className="activity-log-list">
            {logs.map(log => (
              <div key={log._id} className="card activity-log-item">
                <div className="log-item-left">
                  <div
                    className="log-item-icon"
                    style={{ backgroundColor: ACTIVITY_COLORS[log.activityType] + '20', color: ACTIVITY_COLORS[log.activityType] }}
                  >
                    <ActivityIcon type={log.activityType} size={18} />
                  </div>
                  <div className="log-item-info">
                    <p className="log-item-name">{getActivityLabel(log)}</p>
                    <p className="log-item-meta">
                      {log.duration} min
                      {log.distance ? ` · ${log.distance} km` : ''}
                    </p>
                  </div>
                </div>
                <div className="log-item-right">
                  <div className="log-item-burned">
                    <span className="log-burned-value">−{Math.round(log.caloriesBurned)}</span>
                    <span className="log-burned-unit">kcal</span>
                  </div>
                  <button
                    className="log-delete-btn"
                    onClick={() => handleDelete(log._id)}
                    disabled={deletingId === log._id}
                    aria-label="Delete activity"
                  >
                    {deletingId === log._id ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function estimateCalories(activityType, duration, distance) {
  const rates = { running: 10, walking: 5, cardio: 8, swimming: 7, cycling: 6, custom: 5 }
  if (distance && distance > 0) {
  if (activityType === 'running') return Math.round(distance * 60)
  if (activityType === 'walking') return Math.round(distance * 40)
  if (activityType === 'cardio') return Math.round(distance * 50)
  if (activityType === 'swimming') return Math.round(distance * 300)
  if (activityType === 'cycling') return Math.round(distance * 40)
}

return Math.round((rates[activityType] || 5) * duration)
}