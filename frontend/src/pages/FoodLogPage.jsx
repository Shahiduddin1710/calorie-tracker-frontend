import { useState, useEffect, useRef } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' }
const MEAL_TIMES = { breakfast: '7:00 - 9:00 AM', lunch: '12:00 - 2:00 PM', dinner: '7:00 - 9:00 PM', snack: 'Anytime' }

export default function FoodLogPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(new Date())
  const [logs, setLogs] = useState({ breakfast: [], lunch: [], dinner: [], snack: [] })
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedFood, setSelectedFood] = useState(null)
  const [servings, setServings] = useState(1)
  const [addingLog, setAddingLog] = useState(false)
  const searchTimeout = useRef(null)
  const dateStr = format(date, 'yyyy-MM-dd')

  useEffect(() => { fetchLogs() }, [date])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/log/${dateStr}`)
      setLogs(res.data.logs)
      setTotals(res.data.totals)
    } catch { toast.error('Failed to load food log.') }
    finally { setLoading(false) }
  }

  const handleSearch = (q) => {
    setSearchQ(q)
    clearTimeout(searchTimeout.current)
    if (!q.trim()) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/food/search?q=${encodeURIComponent(q)}&limit=15`)
        setSearchResults(res.data.foods)
      } catch { toast.error('Search failed.') }
      finally { setSearching(false) }
    }, 400)
  }

  const handleAddLog = async () => {
    if (!selectedFood || !servings) return
    setAddingLog(true)
    try {
      await api.post('/log', { foodId: selectedFood._id, date: dateStr, meal: addModal, servings: parseFloat(servings) })
      toast.success(`${selectedFood.name} added to ${MEAL_LABELS[addModal]}`)
      setAddModal(null); setSelectedFood(null); setSearchQ(''); setSearchResults([]); setServings(1)
      fetchLogs()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add food.') }
    finally { setAddingLog(false) }
  }

  const handleDeleteLog = async (logId, foodName) => {
    try {
      await api.delete(`/log/${logId}`)
      toast.success(`${foodName} removed.`)
      fetchLogs()
    } catch { toast.error('Failed to remove food.') }
  }

  const openAdd = (meal) => { setAddModal(meal); setSelectedFood(null); setSearchQ(''); setSearchResults([]); setServings(1) }
  const closeModal = () => { setAddModal(null); setSelectedFood(null); setSearchQ('') }

  const calorieGoal = user?.profile?.dailyCalorieGoal || 2000
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')

  const selectFood = (food) => { setSelectedFood(food); setServings(food.servingSize || 100); setSearchResults([]); setSearchQ(food.name) }

  const estimatedNutrients = selectedFood ? {
    calories: Math.round(selectedFood.nutrients.calories * servings / selectedFood.servingSize * 10) / 10,
    protein:  Math.round(selectedFood.nutrients.protein  * servings / selectedFood.servingSize * 10) / 10,
    carbs:    Math.round(selectedFood.nutrients.carbs    * servings / selectedFood.servingSize * 10) / 10,
    fat:      Math.round(selectedFood.nutrients.fat      * servings / selectedFood.servingSize * 10) / 10
  } : null

  const progressPct = Math.min((totals.calories / calorieGoal) * 100, 100)
  const overGoal = totals.calories > calorieGoal

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto" style={{ color: 'var(--text-primary)' }}>
      {/* Date nav */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setDate(d => subDays(d, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ backgroundColor: 'var(--bg-3)', color: 'var(--text-secondary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {isToday ? 'Today' : format(date, 'EEEE, MMMM d')}
          </h1>
          {!isToday && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{format(date, 'yyyy-MM-dd')}</p>}
        </div>
        <button onClick={() => setDate(d => addDays(d, 1))} disabled={isToday}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
          style={{ backgroundColor: 'var(--bg-3)', color: 'var(--text-secondary)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Summary bar */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-4 gap-3 text-center mb-3">
          <div>
            <p className="text-xl font-bold calorie-number" style={{ color: 'var(--text-primary)' }}>{Math.round(totals.calories)}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Eaten</p>
          </div>
          <div>
            <p className="text-xl font-bold calorie-number" style={{ color: overGoal ? '#ef4444' : 'var(--brand)' }}>
              {Math.max(calorieGoal - Math.round(totals.calories), 0)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Remaining</p>
          </div>
          <div>
            <p className="text-xl font-bold calorie-number" style={{ color: '#3b82f6' }}>{Math.round(totals.protein)}g</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Protein</p>
          </div>
          <div>
            <p className="text-xl font-bold calorie-number" style={{ color: '#f59e0b' }}>{Math.round(totals.carbs)}g</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Carbs</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-3)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, backgroundColor: overGoal ? '#ef4444' : 'var(--brand)' }} />
        </div>
      </div>

      {/* Meal sections */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--bg-3)' }} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {MEALS.map(meal => {
            const mealLogs = logs[meal] || []
            const mealCals = mealLogs.reduce((s, l) => s + (l.nutrients?.calories || 0), 0)
            return (
              <div key={meal} className="card" style={{ borderLeft: '3px solid var(--border)' }}>
                <div className="flex items-center justify-between p-4 pb-3">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{MEAL_LABELS[meal]}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{MEAL_TIMES[meal]}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {mealCals > 0 && (
                      <span className="text-sm font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {Math.round(mealCals)} kcal
                      </span>
                    )}
                    <button onClick={() => openAdd(meal)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: 'var(--brand-dim)', color: 'var(--brand-text)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {mealLogs.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border)' }}>
                    {mealLogs.map(log => (
                      <div key={log._id} className="flex items-center justify-between px-4 py-3 group food-item-enter"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{log.food?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {log.servings}{log.food?.servingUnit || 'g'} ·{' '}
                            <span style={{ color: '#22c55e' }}>{Math.round(log.nutrients.protein)}g P</span> ·{' '}
                            <span style={{ color: '#3b82f6' }}>{Math.round(log.nutrients.carbs)}g C</span> ·{' '}
                            <span style={{ color: '#f59e0b' }}>{Math.round(log.nutrients.fat)}g F</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <span className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {Math.round(log.nutrients.calories)}
                          </span>
                          <button onClick={() => handleDeleteLog(log._id, log.food?.name)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 transition-all"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mealLogs.length === 0 && (
                  <div className="px-4 pb-4">
                    <button onClick={() => openAdd(meal)}
                      className="w-full h-10 rounded-xl text-sm transition-all"
                      style={{ border: '1.5px dashed var(--border)', color: 'var(--text-muted)', backgroundColor: 'transparent' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand-text)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}>
                      Add food to {MEAL_LABELS[meal].toLowerCase()}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add food modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeModal}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up"
            style={{ backgroundColor: 'var(--bg-1)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Add to {MEAL_LABELS[addModal]}</h3>
              <button onClick={closeModal} style={{ color: 'var(--text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-3">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" value={searchQ} onChange={e => handleSearch(e.target.value)}
                  className="input-field pl-9 pr-4" placeholder="Search foods..." autoFocus />
                {searching && (
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" width="16" height="16"
                    fill="none" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
              </div>

              {searchResults.length > 0 && !selectedFood && (
                <div className="max-h-52 overflow-y-auto rounded-xl mb-3"
                  style={{ border: '1px solid var(--border)' }}>
                  {searchResults.map(food => (
                    <button key={food._id} onClick={() => selectFood(food)}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{food.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{food.servingSize}{food.servingUnit}</p>
                        </div>
                        <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{food.nutrients.calories} kcal</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedFood && (
                <div className="rounded-xl p-4 mb-3" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedFood.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Per {selectedFood.servingSize}{selectedFood.servingUnit}</p>
                    </div>
                    <button onClick={() => { setSelectedFood(null); setSearchQ('') }} style={{ color: 'var(--text-muted)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <label className="text-sm flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>Amount ({selectedFood.servingUnit})</label>
                    <input type="number" value={servings} onChange={e => setServings(e.target.value)}
                      className="input-field py-2 text-sm flex-1" min="1" step="1" />
                  </div>
                  {estimatedNutrients && (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Cal',    value: estimatedNutrients.calories, unit: '',  color: 'var(--text-primary)' },
                        { label: 'Protein',value: estimatedNutrients.protein,  unit: 'g', color: '#22c55e' },
                        { label: 'Carbs',  value: estimatedNutrients.carbs,    unit: 'g', color: '#3b82f6' },
                        { label: 'Fat',    value: estimatedNutrients.fat,      unit: 'g', color: '#f59e0b' }
                      ].map(n => (
                        <div key={n.label} className="text-center rounded-lg p-2" style={{ backgroundColor: 'var(--bg-3)' }}>
                          <p className="text-sm font-bold calorie-number" style={{ color: n.color }}>{n.value}{n.unit}</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleAddLog} disabled={!selectedFood || addingLog}
                className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                {addingLog ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Adding...</>
                ) : 'Add to log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
