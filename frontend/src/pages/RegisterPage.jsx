import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import axiosInstance from '../axiosInstance'
import { useAuth } from '../context/AuthContext'
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
    <div className="relative min-h-screen bg-neutral-950">
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color="rgba(120, 120, 120, 1)"
          animation={{ scale: 80, speed: 80 }}
          noise={{ opacity: 0.8, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: '#0a0a0a' }}
        />
      </div>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
          <h1 className="mb-2 text-center text-2xl font-bold text-white">Register</h1>
          <p className="mb-1 text-center text-sm text-neutral-400">Create your Capstone Monitor account</p>
          <p className="mb-6 text-center text-xs text-neutral-500">
            Mentor &amp; Coordinator registration requires an invite code from your coordinator.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-300">Name</label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                placeholder="Your full name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-300">Email</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-neutral-300">Password</label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                placeholder="Create a password"
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="role" className="mb-1 block text-sm font-medium text-neutral-300">Role</label>
              <select
                id="role"
                {...register('role', { required: 'Role is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
              >
                <option value="mentor" className="bg-neutral-900">Mentor</option>
                <option value="coordinator" className="bg-neutral-900">Coordinator</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
            </div>

            <div>
              <label htmlFor="inviteCode" className="mb-1 block text-sm font-medium text-neutral-300">Invite Code</label>
              <input
                id="inviteCode"
                type="text"
                {...register('inviteCode', { required: 'Invite code is required' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
                placeholder="Enter your invite code"
              />
              {errors.inviteCode && <p className="mt-1 text-xs text-red-400">{errors.inviteCode.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-white hover:underline">
              Login
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-neutral-500">
            To register a capstone project team, use the{' '}
            <Link to="/register-team" className="font-semibold text-neutral-300 hover:underline">
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