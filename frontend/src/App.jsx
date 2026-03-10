import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import LoadingScreen from './components/LoadingScreen'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import SigninPage from './pages/SigninPage'
import OTPPage from './pages/OTPPage'
import DashboardPage from './pages/DashboardPage'
import FoodLogPage from './pages/FoodLogPage'
import ProfilePage from './pages/ProfilePage'
import ProgressPage from './pages/ProgressPage'
import FoodsPage from './pages/FoodsPage'
import Layout from './components/Layout'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

const ToasterWrapper = () => {
  const { theme } = useTheme()
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: theme === 'dark' ? '#1c1c21' : '#ffffff',
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          border: theme === 'dark' ? '1px solid #2a2a32' : '1px solid #e2e8f0',
          borderRadius: '12px',
          fontSize: '14px',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          boxShadow: theme === 'dark' ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.1)'
        },
        success: { iconTheme: { primary: '#22c55e', secondary: theme === 'dark' ? '#0d2818' : '#f0fdf4' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: theme === 'dark' ? '#1a0808' : '#fef2f2' } }
      }}
    />
  )
}

const AppRoutes = () => {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />
  return (
    <Routes>
      <Route path="/"       element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/signin" element={<PublicRoute><SigninPage /></PublicRoute>} />
      <Route path="/verify" element={<OTPPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="log"       element={<FoodLogPage />} />
        <Route path="foods"     element={<FoodsPage />} />
        <Route path="progress"  element={<ProgressPage />} />
        <Route path="profile"   element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToasterWrapper />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
