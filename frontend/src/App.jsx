import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import TeamLeaderRoute from './components/common/TeamLeaderRoute'
import { EtheralShadow } from '@/components/ui/EtheralShadow'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import AboutPage from './pages/AboutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TeamRegisterPage from './pages/TeamRegisterPage'
import PendingApprovalPage from './pages/PendingApprovalPage'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard'
import MentorDashboard from './pages/mentor/MentorDashboard'
import TeamLeaderDashboard from './pages/teamleader/TeamLeaderDashboard'

function Layout() {
  const { isDark } = useTheme()
  return (
    <div className="min-h-screen relative bg-page">
      {/* Fixed Ethereal Shadow Background */}
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color={isDark ? 'rgba(120, 120, 120, 1)' : 'rgba(80, 120, 200, 0.45)'}
          animation={{ scale: 80, speed: 40 }}
          noise={{ opacity: isDark ? 0.8 : 0.35, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: isDark ? '#0a0a0a' : '#e4e8f0' }}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 min-h-screen">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function UnauthorizedPage() {
  const { isDark } = useTheme()
  return (
    <div className="relative min-h-screen bg-page">
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color={isDark ? 'rgba(120, 120, 120, 1)' : 'rgba(80, 120, 200, 0.45)'}
          animation={{ scale: 80, speed: 40 }}
          noise={{ opacity: isDark ? 0.8 : 0.35, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: isDark ? '#0a0a0a' : '#e4e8f0' }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="mb-3 text-5xl">🔒</p>
        <h1 className="mb-2 text-2xl font-bold text-heading">Access Denied</h1>
        <p className="mb-6 text-secondary">You don&apos;t have permission to view this page.</p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-md bg-btn px-5 py-2 text-sm font-semibold text-ink hover:bg-btn-hover transition"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

function AppContent() {
  const { isDark } = useTheme()
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme={isDark ? 'dark' : 'light'} />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-team" element={<TeamRegisterPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<Layout />}>
          <Route element={<TeamLeaderRoute />}>
            <Route path="/teamleader/dashboard" element={<TeamLeaderDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['coordinator']} />}>
            <Route
              path="/coordinator/dashboard"
              element={<CoordinatorDashboard />}
            />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
