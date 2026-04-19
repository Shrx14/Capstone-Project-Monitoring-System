import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '../axiosInstance'
import { useAuth } from '../context/AuthContext'

const getDashboardPath = (role) => {
  const dashboardByRole = {
    student: '/student/dashboard',
    mentor: '/mentor/dashboard',
    coordinator: '/coordinator/dashboard',
  }

  return dashboardByRole[role] || '/login'
}

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (formData) => {
    try {
      const response = await axiosInstance.post('/auth/login', formData)
      const { user, token } = response.data

      login(user, token)
      navigate(getDashboardPath(user?.role))
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-2xl font-bold text-blue-900">Login</h1>
        <p className="mb-6 text-center text-sm text-slate-600">Sign in to continue to Capstone Monitor</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: 'Email is required',
              })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-900 transition focus:border-blue-900 focus:ring-2"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
              })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-blue-900 transition focus:border-blue-900 focus:ring-2"
              placeholder="Enter your password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-900 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage