import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
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

const AppRoutes = () => {
  const { loading } = useAuth()
  if (loading) return <LoadingScreen />
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/signin" element={<PublicRoute><SigninPage /></PublicRoute>} />
      <Route path="/verify" element={<OTPPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="log" element={<FoodLogPage />} />
        <Route path="foods" element={<FoodsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
            },
            success: {
              iconTheme: { primary: '#2dd4bf', secondary: '#f0fdfa' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fef2f2' }
            }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}