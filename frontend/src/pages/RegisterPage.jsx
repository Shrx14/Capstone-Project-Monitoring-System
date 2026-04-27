import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import axiosInstance from '../axiosInstance'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { EtheralShadow } from '@/components/ui/EtheralShadow'

const getDashboardPath = (role) => {
  const dashboardByRole = {
    mentor: '/mentor/dashboard',
    coordinator: '/coordinator/dashboard',
  }
  return dashboardByRole[role] || '/login'
}

function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { name: '', email: '', password: '', role: 'mentor', inviteCode: '' } })

  const onSubmit = async (formData) => {
    try {
      const response = await axiosInstance.post('/auth/register', formData)
      const { user, token } = response.data
      login(user, token)
      navigate(getDashboardPath(user?.role))
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div className="relative min-h-screen bg-page">
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color={isDark ? 'rgba(120, 120, 120, 1)' : 'rgba(100, 140, 200, 0.5)'}
          animation={{ scale: 80, speed: 80 }}
          noise={{ opacity: isDark ? 0.8 : 0.4, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: isDark ? '#0a0a0a' : '#eef0f5' }}
        />
      </div>

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-line bg-surface p-2 text-secondary backdrop-blur-sm transition hover:bg-surface-alt hover:text-heading"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 shadow-2xl backdrop-blur-xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-heading"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
          <h1 className="mb-2 text-center text-2xl font-bold text-heading">Register</h1>
          <p className="mb-1 text-center text-sm text-secondary">Create your Capstone Monitor account</p>
          <p className="mb-6 text-center text-xs text-muted">
            Mentor &amp; Coordinator registration requires an invite code from your coordinator.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-body">Name</label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-heading placeholder-hint outline-none transition focus:border-line-focus focus:ring-2 focus:ring-accent"
                placeholder="Your full name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-body">Email</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-heading placeholder-hint outline-none transition focus:border-line-focus focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-body">Password</label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-heading placeholder-hint outline-none transition focus:border-line-focus focus:ring-2 focus:ring-accent"
                placeholder="Create a password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-body">Role</label>
              <select
                id="role"
                {...register('role', { required: 'Role is required' })}
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-heading outline-none transition focus:border-line-focus focus:ring-2 focus:ring-accent"
              >
                <option value="mentor" className="bg-option text-heading">Mentor</option>
                <option value="coordinator" className="bg-option text-heading">Coordinator</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
            </div>

            <div>
              <label htmlFor="inviteCode" className="mb-1 block text-sm font-medium text-body">Invite Code</label>
              <input
                id="inviteCode"
                type="text"
                {...register('inviteCode', { required: 'Invite code is required' })}
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-heading placeholder-hint outline-none transition focus:border-line-focus focus:ring-2 focus:ring-accent"
                placeholder="Enter your invite code"
              />
              {errors.inviteCode && <p className="mt-1 text-xs text-red-400">{errors.inviteCode.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-btn px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-btn-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-heading hover:underline">
              Login
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-muted">
            To register a capstone project team, use the{' '}
            <Link to="/register-team" className="font-semibold text-body hover:underline">
              Register Team page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage