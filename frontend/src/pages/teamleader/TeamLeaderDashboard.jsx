import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'

function TeamLeaderDashboard() {
  const { user, team: contextTeam, updateTeam } = useAuth()
  const [team, setTeam] = useState(contextTeam)
  const [schedule, setSchedule] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white">Team Leader Dashboard</h2>
          <p className="mt-1 text-sm text-neutral-400">Welcome, {user?.name}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-lg font-semibold text-white">Team</h3>
          {!team ? (
            <p className="text-sm text-neutral-500">No team linked to your account.</p>
          ) : (
            <div className="space-y-2 text-sm text-neutral-300">
              <p><span className="text-neutral-500">Team ID:</span> <span className="font-mono">{team.teamId}</span></p>
              <p><span className="text-neutral-500">Status:</span> {team.status}</p>
              <p><span className="text-neutral-500">Category:</span> {team.category}</p>
              <p><span className="text-neutral-500">Branch:</span> {team.branch}</p>
              <p><span className="text-neutral-500">Academic Year:</span> {team.academicYear}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-lg font-semibold text-white">Project Schedule</h3>
          {!schedule ? (
            <p className="text-sm text-neutral-500">
              No project schedule has been uploaded yet. Your coordinator will upload it soon.
            </p>
          ) : (
            <div>
              <h4 className="text-base font-semibold text-neutral-100">{schedule.title}</h4>
              {schedule.description && <p className="mt-1 text-sm text-neutral-400">{schedule.description}</p>}
              <div className="mt-4 space-y-3">
                {[...(schedule.tasks || [])]
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || new Date(a.fromDate) - new Date(b.fromDate))
                  .map((task) => {
                    const submission = submissions.find((s) => String(s.taskId) === String(task._id))
                    return (
                      <div key={task._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">Step {(task.order ?? 0) + 1} - {task.title}</p>
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-300">
                            {submission?.status || 'not_started'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">
                          {new Date(task.fromDate).toLocaleDateString()} to {new Date(task.toDate).toLocaleDateString()}
                        </p>
                        {task.description && <p className="mt-1 text-sm text-neutral-400">{task.description}</p>}
                      </div>
                    )
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 lg:col-span-1">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-lg font-semibold text-white">Quick Stats</h3>
          <div className="space-y-2 text-sm text-neutral-300">
            <p>Total Tasks: {stats.totalTasks}</p>
            <p>Completed: {stats.completed}</p>
            <p>Submitted: {stats.submitted}</p>
            <p className={stats.reassigned > 0 ? 'text-red-300' : ''}>Reassigned: {stats.reassigned}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="mb-3 text-lg font-semibold text-white">Announcements</h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-neutral-500">No announcements yet.</p>
          ) : (
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {announcements.map((item) => (
                <div key={item._id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-sm text-neutral-300">{item.message}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Date(item.date).toLocaleDateString()} · {item.createdBy?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TeamLeaderDashboard
