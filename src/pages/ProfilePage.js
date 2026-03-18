import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [profileForm, setProfileForm] = useState({
    age: user?.profile?.age || '',
    gender: user?.profile?.gender || '',
    height: user?.profile?.height || '',
    weight: user?.profile?.weight || '',
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSavingProfile(false)
    }
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setSavingPass(false)
    }
  }

  const profile = user?.profile || {}

  return (
    <div className="profile-container">
      <div className="profile-heading">
        <h1 className="profile-title">Profile</h1>
        <p className="profile-sub">Manage your account and nutrition goals</p>
      </div>

      <div className="card user-card">
        <div className="user-card-top">
          <div className="user-avatar">
            <span className="user-avatar-letter">{user?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
            <div className="user-verified">
              <div className="verified-dot" />
              <span className="verified-text">Verified</span>
            </div>
          </div>
        </div>

        {profile.dailyCalorieGoal && (
          <div className="goals-grid">
            {[
              { label: 'Calorie Goal', value: profile.dailyCalorieGoal, unit: 'kcal', color: '#111827' },
              { label: 'Protein Goal', value: profile.dailyProteinGoal, unit: 'g', color: '#22c55e' },
              { label: 'Carb Goal', value: profile.dailyCarbGoal, unit: 'g', color: '#3b82f6' },
              { label: 'Fat Goal', value: profile.dailyFatGoal, unit: 'g', color: '#f59e0b' }
            ].map(s => (
              <div key={s.label}>
                <p className="goal-value" style={{ color: s.color }}>
                  {s.value}<span className="goal-unit">{s.unit}</span>
                </p>
                <p className="goal-label">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="tabs-row">
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-btn ${tab === t ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card profile-form">
          <p className="form-section-title">Body Information</p>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label className="profile-label">Age *</label>
              <input type="number" value={profileForm.age}
                onChange={e => setProfileForm(p => ({ ...p, age: e.target.value }))}
                className="profile-input" placeholder="25" min="10" max="120" required />
            </div>
            <div className="profile-field">
              <label className="profile-label">Gender *</label>
              <select value={profileForm.gender}
                onChange={e => setProfileForm(p => ({ ...p, gender: e.target.value }))}
                className="profile-input" required>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="profile-field">
              <label className="profile-label">Height (cm) *</label>
              <input type="number" value={profileForm.height}
                onChange={e => setProfileForm(p => ({ ...p, height: e.target.value }))}
                className="profile-input" placeholder="170" min="50" max="300" required />
            </div>
            <div className="profile-field">
              <label className="profile-label">Weight (kg) *</label>
              <input type="number" value={profileForm.weight}
                onChange={e => setProfileForm(p => ({ ...p, weight: e.target.value }))}
                className="profile-input" placeholder="70" min="20" max="500" required />
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-label">Activity Level</label>
            <select value={profileForm.activityLevel}
              onChange={e => setProfileForm(p => ({ ...p, activityLevel: e.target.value }))}
              className="profile-input">
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Light (exercise 1-3 days/week)</option>
              <option value="moderate">Moderate (exercise 3-5 days/week)</option>
              <option value="active">Active (hard exercise 6-7 days/week)</option>
              <option value="very_active">Very Active (very hard exercise daily)</option>
            </select>
          </div>

          <div className="profile-field">
            <label className="profile-label">Goal</label>
            <div className="goal-selector">
              {[
                { value: 'lose', label: 'Lose weight', icon: '↓' },
                { value: 'maintain', label: 'Maintain', icon: '→' },
                { value: 'gain', label: 'Gain muscle', icon: '↑' }
              ].map(g => (
                <button key={g.value} type="button"
                  onClick={() => setProfileForm(p => ({ ...p, goal: g.value }))}
                  className={`goal-btn ${profileForm.goal === g.value ? 'goal-btn-active' : 'goal-btn-inactive'}`}>
                  <span className="goal-btn-icon">{g.icon}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={savingProfile} className="btn-primary profile-save-btn">
            {savingProfile ? (
              <>
                <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                </svg>
                Saving...
              </>
            ) : 'Save & recalculate goals'}
          </button>
          <p className="profile-hint">Goals are calculated using the Mifflin-St Jeor equation</p>
        </form>
      )}

      {tab === 'security' && (
        <form onSubmit={handlePassChange} className="card profile-form">
          <p className="form-section-title">Change Password</p>
          {[
            { key: 'currentPassword', label: 'Current password', placeholder: 'Your current password' },
            { key: 'newPassword', label: 'New password', placeholder: 'Min 6 characters' },
            { key: 'confirmPassword', label: 'Confirm new password', placeholder: 'Repeat new password' }
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="profile-field">
              <label className="profile-label">{label}</label>
              <input type="password" value={passForm[key]}
                onChange={e => setPassForm(p => ({ ...p, [key]: e.target.value }))}
                className="profile-input" placeholder={placeholder} required />
            </div>
          ))}
          <button type="submit" disabled={savingPass} className="btn-primary profile-save-btn">
            {savingPass ? (
              <>
                <svg className="spinner" width="16" height="16" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
                </svg>
                Changing...
              </>
            ) : 'Change password'}
          </button>
        </form>
      )}
    </div>
  )
}
