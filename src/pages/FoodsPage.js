import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'
import './FoodsPage.css'

const CATEGORIES = ['all', 'protein', 'vegetable', 'fruit', 'grain', 'dairy', 'fat', 'beverage', 'snack', 'other']

export default function FoodsPage() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [category, setCategory] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', servingSize: 100, servingUnit: 'g',
    category: 'other', calories: '', protein: '', carbs: '', fat: '', fiber: ''
  })
  const searchTimeout = useRef(null)

  useEffect(() => { searchFoods('') }, [category])

  const searchFoods = async (q) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 30 })
      if (q !== undefined && q.trim()) params.append('q', q.trim())
      if (category !== 'all') params.append('category', category)
      const res = await api.get(`/food/search?${params}`)
      setFoods(res.data.foods || [])
    } catch (err) {
      console.error('Search error:', err)
      toast.error('Failed to load foods.')
      setFoods([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (q) => {
    setSearchQ(q)
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchFoods(q), 400)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name || !form.calories) return toast.error('Name and calories are required.')
    setCreating(true)
    try {
      await api.post('/food', {
        name: form.name.trim(),
        brand: form.brand.trim(),
        servingSize: parseFloat(form.servingSize),
        servingUnit: form.servingUnit,
        category: form.category,
        nutrients: {
          calories: parseFloat(form.calories) || 0,
          protein: parseFloat(form.protein) || 0,
          carbs: parseFloat(form.carbs) || 0,
          fat: parseFloat(form.fat) || 0,
          fiber: parseFloat(form.fiber) || 0
        }
      })
      toast.success(`${form.name} added.`)
      setShowCreate(false)
      setForm({ name: '', brand: '', servingSize: 100, servingUnit: 'g', category: 'other', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
      searchFoods(searchQ)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create food.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="foods-container">
      <div className="foods-header">
        <div>
          <h1 className="foods-title">Food Database</h1>
          <p className="foods-sub">Search and manage foods</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary add-food-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add custom food
        </button>
      </div>

      <div className="foods-filters">
        <div className="search-wrapper">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" value={searchQ} onChange={e => handleSearch(e.target.value)}
            className="search-input" placeholder="Search foods..." />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)} className="category-select">
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="skeleton-list">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton skeleton-row" />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="empty-title">No foods found</p>
          <p className="empty-sub">Try a different search term or category</p>
        </div>
      ) : (
        <div className="foods-list card">
          {foods.map((food, idx) => (
            <div key={food._id} className="food-row"
              style={{ borderBottom: idx < foods.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <div className="food-row-left">
                <div className="food-row-name-row">
                  <p className="food-name">{food.name}</p>
                  {food.isCustom && <span className="custom-badge">custom</span>}
                </div>
                <p className="food-serving">Per {food.servingSize}{food.servingUnit} · {food.category}</p>
              </div>
              <div className="food-row-right">
                <div className="food-macros">
                  <span style={{ color: '#22c55e' }}>{food.nutrients.protein}g P</span>
                  <span style={{ color: '#3b82f6' }}>{food.nutrients.carbs}g C</span>
                  <span style={{ color: '#f59e0b' }}>{food.nutrients.fat}g F</span>
                </div>
                <span className="food-kcal">{food.nutrients.calories} kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add custom food</h3>
              <button onClick={() => setShowCreate(false)} className="modal-close-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-grid">
                <div className="form-field full-width">
                  <label className="form-label">Food name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="form-input" placeholder="e.g. Grilled Chicken" required />
                </div>
                <div className="form-field">
                  <label className="form-label">Brand</label>
                  <input value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))}
                    className="form-input" placeholder="Optional" />
                </div>
                <div className="form-field">
                  <label className="form-label">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="form-input">
                    {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Serving size</label>
                  <input type="number" value={form.servingSize} onChange={e => setForm(p => ({ ...p, servingSize: e.target.value }))}
                    className="form-input" />
                </div>
                <div className="form-field">
                  <label className="form-label">Unit</label>
                  <select value={form.servingUnit} onChange={e => setForm(p => ({ ...p, servingUnit: e.target.value }))}
                    className="form-input">
                    {['g', 'ml', 'oz', 'piece', 'cup', 'tbsp', 'tsp'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="nutrition-section">
                <p className="nutrition-title">Nutrition per serving</p>
                <div className="form-grid">
                  {[
                    { key: 'calories', label: 'Calories (kcal) *', req: true },
                    { key: 'protein', label: 'Protein (g)' },
                    { key: 'carbs', label: 'Carbs (g)' },
                    { key: 'fat', label: 'Fat (g)' },
                    { key: 'fiber', label: 'Fiber (g)' }
                  ].map(({ key, label, req }) => (
                    <div key={key} className="form-field">
                      <label className="form-label">{label}</label>
                      <input type="number" step="0.1" min="0"
                        value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        className="form-input" placeholder="0" required={req} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={creating} className="btn-primary submit-btn">
                {creating ? (
                  <>
                    <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                    </svg>
                    Adding...
                  </>
                ) : 'Add food'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}