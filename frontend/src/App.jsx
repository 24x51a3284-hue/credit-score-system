import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import SignupPage     from './pages/SignupPage'
import DashboardPage  from './pages/DashboardPage'
import PredictPage    from './pages/PredictPage'
import HistoryPage    from './pages/HistoryPage'
import AdminPage      from './pages/AdminPage'
import Layout         from './components/ui/Layout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-400">Loading…</div>
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1F2937', color: '#F9FAFB', border: '1px solid #374151' },
              success: { iconTheme: { primary: '#10B981', secondary: '#F9FAFB' } },
              error:   { iconTheme: { primary: '#EF4444', secondary: '#F9FAFB' } },
            }}
          />
          <Routes>
            <Route path="/"        element={<LandingPage />} />
            <Route path="/login"   element={<LoginPage />} />
            <Route path="/signup"  element={<SignupPage />} />

            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="predict"   element={<PredictPage />} />
              <Route path="history"   element={<HistoryPage />} />
            </Route>

            <Route path="/admin" element={<AdminRoute><Layout /></AdminRoute>}>
              <Route index element={<AdminPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
