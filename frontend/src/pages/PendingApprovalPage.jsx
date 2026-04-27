import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CircleX, Moon, Sun } from 'lucide-react'
import { toast } from 'react-toastify'
import axiosInstance from '../axiosInstance'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { EtheralShadow } from '@/components/ui/EtheralShadow'

function PendingApprovalPage() {
  const navigate = useNavigate()
  const { user, team, updateTeam, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [checking, setChecking] = useState(false)

  const handleCheckStatus = async () => {
    setChecking(true)
    try {
      const res = await axiosInstance.get('/teams/my')
      const nextTeam = res.data.data
      updateTeam(nextTeam)

      if (nextTeam.status === 'approved') {
        toast.success('Your team has been approved!')
        navigate('/teamleader/dashboard')
      } else if (nextTeam.status === 'rejected') {
        toast.error('Your team was rejected.')
      } else {
        toast.info('Still pending approval.')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to fetch team status')
    } finally {
      setChecking(false)
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
        <div className="w-full max-w-xl rounded-2xl border border-line bg-surface p-8 shadow-2xl backdrop-blur-xl">
          {team?.status === 'rejected' ? (
            <>
              <div className="mb-4 flex justify-center text-red-400">
                <CircleX size={44} />
              </div>
              <h1 className="text-center text-2xl font-bold text-heading">Registration Rejected</h1>
              <p className="mt-3 text-center text-sm text-secondary">
                Your team registration was rejected by the coordinator.
              </p>
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {team?.rejectionReason || 'No rejection reason provided.'}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/register-team')
                }}
                className="mt-6 w-full rounded-lg bg-btn px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-btn-hover"
              >
                Register a New Team
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-center text-amber-300">
                <Clock size={44} />
              </div>
              <h1 className="text-center text-2xl font-bold text-heading">Awaiting Coordinator Approval</h1>
              <p className="mt-3 text-center text-sm text-secondary">
                Your team registration is under review. Once approved and assigned a mentor, dashboard access will open.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-body">
                <div className="rounded-lg border border-line bg-surface p-3">
                  <p className="text-xs text-muted">Team ID</p>
                  <p className="font-mono">{team?.teamId || '-'}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface p-3">
                  <p className="text-xs text-muted">Category</p>
                  <p>{team?.category || '-'}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface p-3">
                  <p className="text-xs text-muted">Branch</p>
                  <p>{team?.branch || '-'}</p>
                </div>
                <div className="rounded-lg border border-line bg-surface p-3">
                  <p className="text-xs text-muted">Academic Year</p>
                  <p>{team?.academicYear || '-'}</p>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="rounded-lg bg-btn px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-btn-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {checking ? 'Checking...' : 'Check Status'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-heading transition hover:bg-surface-alt"
            >
              Logout
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-muted">
            Signed in as {user?.name || 'team leader'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PendingApprovalPage
