import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import TeamInfoCard from '../../components/teamleader/TeamInfoCard'
import TaskCard from '../../components/teamleader/TaskCard'
import TaskSubmitModal from '../../components/teamleader/TaskSubmitModal'

function TeamLeaderDashboard() {
  const { user, team: contextTeam, updateTeam } = useAuth()
  const [team, setTeam] = useState(contextTeam)
  const [schedule, setSchedule] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const teamRes = await axiosInstance.get('/teams/my')
      const nextTeam = teamRes.data.data
      updateTeam(nextTeam)
      setTeam(nextTeam)

      let nextSchedule = null
      try {
        const scheduleRes = await axiosInstance.get(`/schedules/team/${nextTeam._id}`)
        nextSchedule = scheduleRes.data.data
        setSchedule(nextSchedule)
      } catch (error) {
        if (error?.response?.status === 404) {
          setSchedule(null)
        } else {
          throw error
        }
      }

      if (nextSchedule?._id) {
        const subsRes = await axiosInstance.get(`/task-submissions/schedule/${nextSchedule._id}`)
        setSubmissions(subsRes.data.data || [])
      } else {
        setSubmissions([])
      }

      const annRes = await axiosInstance.get('/announcements')
      setAnnouncements(annRes.data.data || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load teamleader dashboard')
    } finally {
      setLoading(false)
    }
  }, [updateTeam])

  useEffect(() => {
    if (contextTeam?._id || user?.role === 'teamleader') {
      fetchAll()
    }
  }, [contextTeam?._id, user?.role, fetchAll])

  const submissionsMap = useMemo(() => {
    const map = {}
    for (const sub of submissions) {
      map[sub.taskId] = sub
    }
    return map
  }, [submissions])

  const stats = useMemo(() => {
    const all = submissions || []
    return {
      totalTasks: schedule?.tasks?.length || 0,
      completed: all.filter((s) => s.status === 'completed').length,
      submitted: all.filter((s) => s.status === 'submitted').length,
      reassigned: all.filter((s) => s.status === 'reassigned').length,
    }
  }, [schedule?.tasks?.length, submissions])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-heading border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-heading">Team Leader Dashboard</h2>
        <p className="text-sm text-secondary">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT (col-span-2) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Team Info Card */}
          {team && <TeamInfoCard team={team} />}

          {/* Project Schedule */}
          <div className="rounded-2xl border border-line bg-surface p-5 backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-semibold text-heading">Project Schedule</h3>
            {!schedule ? (
              <div className="rounded-xl border border-line bg-surface p-6 text-center">
                <p className="text-sm text-muted">
                  No project schedule has been uploaded yet. Your coordinator will upload it soon.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="text-base font-semibold text-heading">{schedule.title}</h4>
                {schedule.description && (
                  <p className="mt-1 text-sm text-secondary">{schedule.description}</p>
                )}
                <div className="mt-4 space-y-3">
                  {[...(schedule.tasks || [])]
                    .sort(
                      (a, b) =>
                        (a.order ?? 0) - (b.order ?? 0) ||
                        new Date(a.fromDate) - new Date(b.fromDate)
                    )
                    .map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        submission={submissionsMap[task._id] || null}
                        onOpenSubmitForm={(t, s) => setActiveModal({ task: t, submission: s })}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (col-span-1) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Stats */}
          <div className="rounded-2xl border border-line bg-surface p-5 backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-semibold text-heading">Quick Stats</h3>
            <div className="space-y-2 text-sm text-body">
              <div className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-secondary">Total Tasks</span>
                <span className="font-bold text-heading">{stats.totalTasks}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2">
                <span className="text-emerald-300">Completed</span>
                <span className="font-bold text-emerald-200">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-yellow-500/10 px-3 py-2">
                <span className="text-yellow-300">Submitted (awaiting)</span>
                <span className="font-bold text-yellow-200">{stats.submitted}</span>
              </div>
              <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${stats.reassigned > 0 ? 'bg-red-500/10' : 'bg-surface'}`}>
                <span className={stats.reassigned > 0 ? 'text-red-300' : 'text-secondary'}>
                  Reassigned {stats.reassigned > 0 ? '⚠' : ''}
                </span>
                <span className={`font-bold ${stats.reassigned > 0 ? 'text-red-200' : 'text-heading'}`}>
                  {stats.reassigned}
                </span>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-2xl border border-line bg-surface p-5 backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-semibold text-heading">Announcements</h3>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted">No announcements yet.</p>
            ) : (
              <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                {announcements.map((item) => (
                  <div key={item._id} className="rounded-xl border border-line bg-surface p-3">
                    <p className="text-sm text-body">{item.message}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(item.date).toLocaleDateString()} · {item.createdBy?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal overlay */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-line bg-elevated p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-heading">Task Submission</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-lg border border-line bg-surface px-3 py-1 text-sm text-secondary hover:bg-surface-alt hover:text-heading transition"
              >
                ✕
              </button>
            </div>
            <TaskSubmitModal
              task={activeModal.task}
              submission={activeModal.submission}
              scheduleId={schedule?._id}
              teamMembers={team?.members || []}
              onClose={() => setActiveModal(null)}
              onSuccess={() => {
                setActiveModal(null)
                fetchAll()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamLeaderDashboard
