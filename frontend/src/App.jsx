import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { EtheralShadow } from '@/components/ui/EtheralShadow'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard'
import MentorDashboard from './pages/mentor/MentorDashboard'
import StudentDashboard from './pages/student/StudentDashboard'

function Layout() {
  return (
    <div className="min-h-screen relative bg-neutral-950">
      {/* Fixed Ethereal Shadow Background */}
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color="rgba(120, 120, 120, 1)"
          animation={{ scale: 80, speed: 40 }}
          noise={{ opacity: 0.8, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: '#0a0a0a' }}
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
  return (
    <div className="relative min-h-screen bg-neutral-950">
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color="rgba(120, 120, 120, 1)"
          animation={{ scale: 80, speed: 40 }}
          noise={{ opacity: 0.8, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: '#0a0a0a' }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="mb-3 text-5xl">🔒</p>
        <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
        <p className="mb-6 text-neutral-400">You don&apos;t have permission to view this page.</p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="rounded-md bg-white px-5 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<Layout />}>
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
