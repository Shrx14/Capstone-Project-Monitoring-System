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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={3000} />

        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/unauthorized"
            element={
              <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-xl font-semibold text-blue-900">
                Access Denied
              </div>
            }
          />

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
