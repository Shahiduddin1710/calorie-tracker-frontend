import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import api from '../utils/api'

const CATEGORIES = ['all', 'protein', 'vegetable', 'fruit', 'grain', 'dairy', 'fat', 'beverage', 'snack', 'other']

export default function FoodsPage() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const [category, setCategory] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', brand: '', servingSize: 100, servingUnit: 'g', category: 'other', calories: '', protein: '', carbs: '', fat: '', fiber: '' })
  const searchTimeout = useRef(null)

  useEffect(() => { searchFoods() }, [category])

  const searchFoods = async (q = searchQ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: 30 })
      if (q.trim()) params.append('q', q.trim())
      if (category !== 'all') params.append('category', category)
      const res = await api.get(`/food/search?${params}`)
      setFoods(res.data.foods)
    } catch { toast.error('Failed to load foods.') }
    finally { setLoading(false) }
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
        name: form.name.trim(), brand: form.brand.trim(),
        servingSize: parseFloat(form.servingSize), servingUnit: form.servingUnit, category: form.category,
        nutrients: { calories: parseFloat(form.calories)||0, protein: parseFloat(form.protein)||0, carbs: parseFloat(form.carbs)||0, fat: parseFloat(form.fat)||0, fiber: parseFloat(form.fiber)||0 }
      })
      toast.success(`${form.name} added.`)
      setShowCreate(false)
      setForm({ name:'', brand:'', servingSize:100, servingUnit:'g', category:'other', calories:'', protein:'', carbs:'', fat:'', fiber:'' })
      searchFoods()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create food.') }
    finally { setCreating(false) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto" style={{ color: 'var(--text-primary)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Food Database</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Search and manage foods</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add custom food
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={searchQ} onChange={e => handleSearch(e.target.value)}
            className="input-field pl-9" placeholder="Search foods..." />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="input-field sm:w-44 capitalize">
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-3)' }} />)}
        </div>
      ) : foods.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-3)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No foods found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Try a different search term or category</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {foods.map((food, idx) => (
            <div key={food._id}
              className="flex items-center justify-between px-4 py-3.5 transition-colors"
              style={{
                borderBottom: idx < foods.length - 1 ? '1px solid var(--border)' : 'none',
                backgroundColor: 'var(--card-bg)'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--card-bg)'}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{food.name}</p>
                  {food.isCustom && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ backgroundColor: 'var(--bg-3)', color: 'var(--text-muted)' }}>custom</span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Per {food.servingSize}{food.servingUnit} · {food.category}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
                  <span style={{ color: '#22c55e' }}>{food.nutrients.protein}g P</span>
                  <span style={{ color: '#3b82f6' }}>{food.nutrients.carbs}g C</span>
                  <span style={{ color: '#f59e0b' }}>{food.nutrients.fat}g F</span>
                </div>
                <span className="text-sm font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                  {food.nutrients.calories} kcal
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up"
            style={{ backgroundColor: 'var(--bg-1)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Add custom food</h3>
              <button onClick={() => setShowCreate(false)} style={{ color: 'var(--text-muted)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Food name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    className="input-field text-sm py-2.5" placeholder="e.g. Grilled Chicken" required />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Brand</label>
                  <input value={form.brand} onChange={e => setForm(p => ({...p, brand: e.target.value}))}
                    className="input-field text-sm py-2.5" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
                    className="input-field text-sm py-2.5 capitalize">
                    {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Serving size</label>
                  <input type="number" value={form.servingSize} onChange={e => setForm(p => ({...p, servingSize: e.target.value}))}
                    className="input-field text-sm py-2.5" />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>Unit</label>
                  <select value={form.servingUnit} onChange={e => setForm(p => ({...p, servingUnit: e.target.value}))}
                    className="input-field text-sm py-2.5">
                    {['g','ml','oz','piece','cup','tbsp','tsp'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2 pt-2" style={{ color: 'var(--text-secondary)' }}>Nutrition per serving</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'calories', label: 'Calories (kcal) *', req: true },
                    { key: 'protein',  label: 'Protein (g)' },
                    { key: 'carbs',    label: 'Carbs (g)' },
                    { key: 'fat',      label: 'Fat (g)' },
                    { key: 'fiber',    label: 'Fiber (g)' }
                  ].map(({ key, label, req }) => (
                    <div key={key}>
                      <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                      <input type="number" step="0.1" min="0"
                        value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}
                        className="input-field text-sm py-2.5" placeholder="0" required={req} />
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={creating} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                {creating ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>Adding...</>
                ) : 'Add food'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
