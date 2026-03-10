import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState({
    age: user?.profile?.age || '', gender: user?.profile?.gender || '',
    height: user?.profile?.height || '', weight: user?.profile?.weight || '',
    activityLevel: user?.profile?.activityLevel || 'moderate',
    goal: user?.profile?.goal || 'maintain'
  })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [tab, setTab] = useState('profile')

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.age || !profileForm.gender || !profileForm.height || !profileForm.weight)
      return toast.error('Please fill in all required fields.')
    setSavingProfile(true)
    try {
      const res = await api.put('/user/profile', profileForm)
      updateUser({ profile: res.data.profile })
      toast.success('Profile updated! Goals have been recalculated.')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile.') }
    finally { setSavingProfile(false) }
  }

  const handlePassChange = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match.')
    if (passForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters.')
    setSavingPass(true)
    try {
      await api.put('/user/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      toast.success('Password changed successfully.')
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password.') }
    finally { setSavingPass(false) }
  }

  const profile = user?.profile || {}

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto" style={{ color: 'var(--text-primary)' }}>
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Profile</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage your account and nutrition goals</p>
      </div>

      {/* User card */}
      <div className="card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--brand-dim)', border: '1px solid var(--brand)' }}>
            <span className="text-xl font-bold" style={{ color: 'var(--brand-text)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--brand-text)' }}>Verified</span>
            </div>
          </div>
        </div>

        {profile.dailyCalorieGoal && (
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Calorie Goal', value: profile.dailyCalorieGoal, unit: 'kcal', color: 'var(--text-primary)' },
              { label: 'Protein Goal', value: profile.dailyProteinGoal, unit: 'g',    color: '#22c55e' },
              { label: 'Carb Goal',    value: profile.dailyCarbGoal,    unit: 'g',    color: '#3b82f6' },
              { label: 'Fat Goal',     value: profile.dailyFatGoal,     unit: 'g',    color: '#f59e0b' }
            ].map(s => (
              <div key={s.label}>
                <p className="text-base font-bold calorie-number" style={{ color: s.color }}>
                  {s.value}<span className="text-xs font-normal ml-0.5" style={{ color: 'var(--text-muted)' }}>{s.unit}</span>
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ backgroundColor: 'var(--bg-3)' }}>
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
            style={{
              backgroundColor: tab === t ? 'var(--bg-1)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Body Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Age *</label>
              <input type="number" value={profileForm.age} onChange={e => setProfileForm(p => ({...p, age: e.target.value}))}
                className="input-field text-sm py-2.5" placeholder="25" min="10" max="120" required />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Gender *</label>
              <select value={profileForm.gender} onChange={e => setProfileForm(p => ({...p, gender: e.target.value}))}
                className="input-field text-sm py-2.5" required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Height (cm) *</label>
              <input type="number" value={profileForm.height} onChange={e => setProfileForm(p => ({...p, height: e.target.value}))}
                className="input-field text-sm py-2.5" placeholder="170" min="50" max="300" required />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Weight (kg) *</label>
              <input type="number" value={profileForm.weight} onChange={e => setProfileForm(p => ({...p, weight: e.target.value}))}
                className="input-field text-sm py-2.5" placeholder="70" min="20" max="500" required />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Activity Level</label>
            <select value={profileForm.activityLevel} onChange={e => setProfileForm(p => ({...p, activityLevel: e.target.value}))}
              className="input-field text-sm py-2.5">
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (hard exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (very hard exercise daily)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'lose',     label: 'Lose weight', icon: '↓' },
                { value: 'maintain', label: 'Maintain',    icon: '→' },
                { value: 'gain',     label: 'Gain muscle', icon: '↑' }
              ].map(g => (
                <button key={g.value} type="button" onClick={() => setProfileForm(p => ({...p, goal: g.value}))}
                  className="p-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: profileForm.goal === g.value ? 'var(--brand-dim)' : 'var(--bg-3)',
                    border: profileForm.goal === g.value ? '1.5px solid var(--brand)' : '1.5px solid var(--border)',
                    color: profileForm.goal === g.value ? 'var(--brand-text)' : 'var(--text-secondary)'
                  }}>
                  <span className="text-lg block mb-1">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={savingProfile} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            {savingProfile ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Saving...</>
            ) : 'Save & recalculate goals'}
          </button>
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Goals are calculated using the Mifflin-St Jeor equation
          </p>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePassChange} className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Change Password</h2>
          {[
            { key: 'currentPassword', label: 'Current password', placeholder: 'Your current password' },
            { key: 'newPassword',     label: 'New password',     placeholder: 'Min 6 characters' },
            { key: 'confirmPassword', label: 'Confirm new password', placeholder: 'Repeat new password' }
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
              <input type="password" value={passForm[key]} onChange={e => setPassForm(p => ({...p, [key]: e.target.value}))}
                className="input-field text-sm py-2.5" placeholder={placeholder} required />
            </div>
          ))}
          <button type="submit" disabled={savingPass} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
            {savingPass ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>Changing...</>
            ) : 'Change password'}
          </button>
        </form>
      )}
    </div>
  )
}
