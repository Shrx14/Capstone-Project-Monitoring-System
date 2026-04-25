import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CircleX } from 'lucide-react'
import { toast } from 'react-toastify'
import axiosInstance from '../axiosInstance'
import { useAuth } from '../context/AuthContext'
import { EtheralShadow } from '@/components/ui/EtheralShadow'

function PendingApprovalPage() {
  const navigate = useNavigate()
  const { user, team, updateTeam, logout } = useAuth()
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
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {team?.status === 'rejected' ? (
            <>
              <div className="mb-4 flex justify-center text-red-400">
                <CircleX size={44} />
              </div>
              <h1 className="text-center text-2xl font-bold text-white">Registration Rejected</h1>
              <p className="mt-3 text-center text-sm text-neutral-400">
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
                className="mt-6 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200"
              >
                Register a New Team
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex justify-center text-amber-300">
                <Clock size={44} />
              </div>
              <h1 className="text-center text-2xl font-bold text-white">Awaiting Coordinator Approval</h1>
              <p className="mt-3 text-center text-sm text-neutral-400">
                Your team registration is under review. Once approved and assigned a mentor, dashboard access will open.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-neutral-300">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-neutral-500">Team ID</p>
                  <p className="font-mono">{team?.teamId || '-'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-neutral-500">Category</p>
                  <p>{team?.category || '-'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-neutral-500">Branch</p>
                  <p>{team?.branch || '-'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-neutral-500">Academic Year</p>
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
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {checking ? 'Checking...' : 'Check Status'}
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Logout
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-neutral-500">
            Signed in as {user?.name || 'team leader'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PendingApprovalPage
