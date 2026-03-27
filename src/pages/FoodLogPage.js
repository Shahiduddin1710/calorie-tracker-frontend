import { useState, useEffect, useRef } from 'react'
import { format, addDays, subDays } from 'date-fns'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import './FoodLogPage.css'

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snacks' }
const MEAL_TIMES = { breakfast: '7:00 - 9:00 AM', lunch: '12:00 - 2:00 PM', dinner: '7:00 - 9:00 PM', snack: 'Anytime' }

export default function FoodLogPage() {
  const { user } = useAuth()
  const [date, setDate] = useState(new Date())
  const [logs, setLogs] = useState({ breakfast: [], lunch: [], dinner: [], snack: [] })
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0, caloriesBurned: 0, netCalories: 0 })
  const [loading, setLoading] = useState(true)
  const [addModal, setAddModal] = useState(null)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false) 
  const [selectedFood, setSelectedFood] = useState(null)
  const [servings, setServings] = useState(1)
  const [addingLog, setAddingLog] = useState(false)
  const searchTimeout = useRef(null)
  const searchInputRef = useRef(null)
  const dateStr = format(date, 'yyyy-MM-dd')

  useEffect(() => { fetchLogs() }, [date])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/log/${dateStr}`)
      setLogs(res.data.logs)
      setTotals(res.data.totals || { calories: 0, protein: 0, carbs: 0, fat: 0, caloriesBurned: 0, netCalories: 0 })
    } catch {
      toast.error('Failed to load food log.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q) => {
    setSearchQ(q)
    setSelectedFood(null)
    clearTimeout(searchTimeout.current)
    if (!q.trim()) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await api.get(`/food/search?q=${encodeURIComponent(q)}&limit=15`)
        setSearchResults(res.data.foods || [])
      } catch {
        toast.error('Search failed.')
      } finally {
        setSearching(false)
      }
    }, 250)
  }

  const handleAddLog = async () => {
    if (!selectedFood || !servings) return
    setAddingLog(true)
    try {
      await api.post('/log', { foodId: selectedFood._id, date: dateStr, meal: addModal, servings: parseFloat(servings) })
      toast.success(`${selectedFood.name} added to ${MEAL_LABELS[addModal]}`)
      setAddModal(null); setSelectedFood(null); setSearchQ(''); setSearchResults([]); setServings(1)
      fetchLogs()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add food.')
    } finally {
      setAddingLog(false)
    }
  }

  const handleDeleteLog = async (logId, foodName) => {
    try {
      await api.delete(`/log/${logId}`)
      toast.success(`${foodName} removed.`)
      fetchLogs()
    } catch {
      toast.error('Failed to remove food.')
    }
  }

  const openAdd = (meal) => {
    setAddModal(meal)
    setSelectedFood(null)
    setSearchQ('')
    setSearchResults([])
    setServings(1)
    setTimeout(() => searchInputRef.current?.focus(), 100)
  }

  const closeModal = () => {
    setAddModal(null)
    setSelectedFood(null)
    setSearchQ('')
    setSearchResults([])
  }

  const selectFood = (food) => {
    setSelectedFood(food)
    setServings(food.servingSize || 100)
    setSearchResults([])
    setSearchQ(food.name)
  }

  const calorieGoal = user?.profile?.dailyCalorieGoal || 2000
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')

  const caloriesBurned = totals.caloriesBurned || 0
  const netCalories = totals.netCalories ?? (totals.calories - caloriesBurned)
  const remaining = calorieGoal - netCalories
  const overGoal = netCalories > calorieGoal
  const progressPct = Math.min((netCalories / calorieGoal) * 100, 100)

  const estimatedNutrients = selectedFood ? {
    calories: Math.round(selectedFood.nutrients.calories * servings / selectedFood.servingSize * 10) / 10,
    protein: Math.round(selectedFood.nutrients.protein * servings / selectedFood.servingSize * 10) / 10,
    carbs: Math.round(selectedFood.nutrients.carbs * servings / selectedFood.servingSize * 10) / 10,
    fat: Math.round(selectedFood.nutrients.fat * servings / selectedFood.servingSize * 10) / 10
  } : null

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  return (
    <div className="foodlog-container">
      <div className="date-nav">
        <button onClick={() => setDate(d => subDays(d, 1))} className="date-nav-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="date-center">
          <h1 className="date-title">{isToday ? 'Today' : format(date, 'EEEE, MMMM d')}</h1>
          {!isToday && <p className="date-sub">{format(date, 'yyyy-MM-dd')}</p>}
        </div>
        <button onClick={() => setDate(d => addDays(d, 1))} disabled={isToday} className="date-nav-btn date-nav-btn-right">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div className="card summary-card">
        <div className="summary-grid">
          <div className="summary-item">
            <p className="summary-number">{Math.round(totals.calories)}</p>
            <p className="summary-label">Eaten</p>
          </div>
          <div className="summary-item">
            <p className="summary-number" style={{ color: overGoal ? '#ef4444' : '#2dd4bf' }}>
              {Math.round(remaining)}
            </p>
            <p className="summary-label">Remaining</p>
          </div>
          <div className="summary-item">
            <p className="summary-number" style={{ color: '#3b82f6' }}>{Math.round(totals.protein)}g</p>
            <p className="summary-label">Protein</p>
          </div>
          <div className="summary-item">
            <p className="summary-number" style={{ color: '#f59e0b' }}>{Math.round(totals.carbs)}g</p>
            <p className="summary-label">Carbs</p>
          </div>
          <div className="summary-item summary-item-burned">
            <div className="burned-pill">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <p className="summary-number summary-number-burned">−{Math.round(caloriesBurned)}</p>
            </div>
            <p className="summary-label">Burned</p>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPct}%`, backgroundColor: overGoal ? '#ef4444' : '#2dd4bf' }} />
        </div>

        {caloriesBurned > 0 && (
          <div className="net-formula">
            <span className="net-formula-part">{Math.round(totals.calories)} eaten</span>
            <span className="net-formula-op">−</span>
            <span className="net-formula-part net-formula-burned">{Math.round(caloriesBurned)} burned</span>
            <span className="net-formula-op">=</span>
            <span className="net-formula-part net-formula-net">{Math.round(netCalories)} net</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="skeleton-list">
          {[1, 2, 3].map(i => <div key={i} className="skeleton skeleton-meal" />)}
        </div>
      ) : (
        <div className="meal-sections">
          {MEALS.map(meal => {
            const mealLogs = logs[meal] || []
            const mealCals = mealLogs.reduce((s, l) => s + (l.nutrients?.calories || 0), 0)
            return (
              <div key={meal} className="card meal-section">
                <div className="meal-header">
                  <div>
                    <h3 className="meal-name">{MEAL_LABELS[meal]}</h3>
                    <p className="meal-time">{MEAL_TIMES[meal]}</p>
                  </div>
                  <div className="meal-header-right">
                    {mealCals > 0 && <span className="meal-kcal">{Math.round(mealCals)} kcal</span>}
                    <button onClick={() => openAdd(meal)} className="add-meal-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {mealLogs.length > 0 && (
                  <div className="meal-log-list">
                    {mealLogs.map(log => (
                      <div key={log._id} className="log-item">
                        <div className="log-info">
                          <p className="log-name">{log.food?.name}</p>
                          <p className="log-macros">
                            {log.servings}{log.food?.servingUnit || 'g'} ·{' '}
                            <span style={{ color: '#22c55e' }}>{Math.round(log.nutrients.protein)}g P</span> ·{' '}
                            <span style={{ color: '#3b82f6' }}>{Math.round(log.nutrients.carbs)}g C</span> ·{' '}
                            <span style={{ color: '#f59e0b' }}>{Math.round(log.nutrients.fat)}g F</span>
                          </p>
                        </div>
                        <div className="log-right">
                          <span className="log-cals">{Math.round(log.nutrients.calories)}</span>
                          <button onClick={() => handleDeleteLog(log._id, log.food?.name)} className="delete-log-btn">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {mealLogs.length === 0 && (
                  <div className="empty-meal">
                    <button onClick={() => openAdd(meal)} className="empty-meal-btn">
                      Add food to {MEAL_LABELS[meal].toLowerCase()}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {addModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add to {MEAL_LABELS[addModal]}</h3>
              <button onClick={closeModal} className="modal-close-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <div className="search-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQ}
                  onChange={e => handleSearch(e.target.value)}
                  className="search-input"
                  placeholder="Type to search, e.g. bana..."
                  autoComplete="off"
                  autoFocus
                />
                {searching && (
                  <svg className="search-spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {searchQ && !searching && (
                  <button className="search-clear-btn" onClick={() => { setSearchQ(''); setSearchResults([]); setSelectedFood(null); searchInputRef.current?.focus() }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {searchQ && !searching && searchResults.length === 0 && !selectedFood && (
                <div className="search-empty">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p>No results for "<strong>{searchQ}</strong>"</p>
                </div>
              )}

              {searchResults.length > 0 && !selectedFood && (
                <div className="search-results">
                  {searchResults.map(food => (
                    <button key={food._id} onClick={() => selectFood(food)} className="search-result-item">
                      <div className="result-left">
                        <p className="result-name">{highlightMatch(food.name, searchQ)}</p>
                        <p className="result-serving">{food.servingSize}{food.servingUnit} · {food.category || 'Food'}</p>
                      </div>
                      <span className="result-cals">{food.nutrients.calories} kcal</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedFood && (
                <div className="selected-food-card">
                  <div className="selected-food-header">
                    <div>
                      <p className="selected-food-name">{selectedFood.name}</p>
                      <p className="selected-food-serving">Per {selectedFood.servingSize}{selectedFood.servingUnit}</p>
                    </div>
                    <button onClick={() => { setSelectedFood(null); setSearchQ(''); setTimeout(() => searchInputRef.current?.focus(), 50) }} className="deselect-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="amount-row">
                    <label className="amount-label">Amount ({selectedFood.servingUnit})</label>
                    <input type="number" value={servings} onChange={e => setServings(e.target.value)}
                      className="amount-input" min="1" step="1" />
                  </div>
                  {estimatedNutrients && (
                    <div className="nutrient-grid">
                      {[
                        { label: 'Cal', value: estimatedNutrients.calories, unit: '', color: '#111827' },
                        { label: 'Protein', value: estimatedNutrients.protein, unit: 'g', color: '#22c55e' },
                        { label: 'Carbs', value: estimatedNutrients.carbs, unit: 'g', color: '#3b82f6' },
                        { label: 'Fat', value: estimatedNutrients.fat, unit: 'g', color: '#f59e0b' }
                      ].map(n => (
                        <div key={n.label} className="nutrient-item">
                          <p className="nutrient-value" style={{ color: n.color }}>{n.value}{n.unit}</p>
                          <p className="nutrient-label">{n.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleAddLog} disabled={!selectedFood || addingLog} className="btn-primary add-log-btn">
                {addingLog ? (
                  <>
                    <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                    </svg>
                    Adding...
                  </>
                ) : 'Add to log'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}