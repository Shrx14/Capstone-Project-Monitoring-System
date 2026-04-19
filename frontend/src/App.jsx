import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CoordinatorDashboard from './pages/coordinator/CoordinatorDashboard'
import MentorDashboard from './pages/mentor/MentorDashboard'
import StudentDashboard from './pages/student/StudentDashboard'

function Layout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center">
      <p className="mb-3 text-5xl">🔒</p>
      <h1 className="mb-2 text-2xl font-bold text-blue-900">Access Denied</h1>
      <p className="mb-6 text-slate-500">You don&apos;t have permission to view this page.</p>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="rounded-md bg-blue-900 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800"
      >
        Go Back
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />

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
