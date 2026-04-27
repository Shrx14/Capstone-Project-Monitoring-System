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
    teamleader: '/teamleader/dashboard',
  }
  return dashboardByRole[role] || '/login'
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async (formData) => {
    try {
      const response = await axiosInstance.post('/auth/login', formData)
      const { user, token, team } = response.data
      login(user, token, team || null)

      if (user?.role === 'teamleader' && (team?.status === 'pending' || team?.status === 'rejected')) {
        navigate('/pending-approval')
        return
      }

      navigate(getDashboardPath(user?.role))
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed. Please try again.'
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
          <h1 className="mb-2 text-center text-2xl font-bold text-heading">Login</h1>
          <p className="mb-6 text-center text-sm text-secondary">Sign in to continue to Capstone Monitor</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-body">
                Email
              </label>
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
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-body">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-heading placeholder-hint outline-none transition focus:border-line-focus focus:ring-2 focus:ring-accent"
                placeholder="Enter your password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-btn px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-btn-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-secondary">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-heading hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage