import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'

import TaskReviewCard from '../../components/mentor/TaskReviewCard'
import GradesOverview from '../../components/mentor/GradesOverview'

function StatusBadge({ status }) {
  const colors = {
    not_started: 'bg-neutral-700 text-neutral-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || 'bg-neutral-700 text-neutral-300'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

function MentorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('projects')

  // Assigned teams displayed as "projects"
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // New state for task review / grades tabs
  const [mentorTeams, setMentorTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [submissions, setSubmissions] = useState([])

  const loadedTabs = useRef(new Set())

  const fetchAssignedTeams = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/teams/mentor-teams')
      const teams = res.data.data || []
      setProjects(teams)
      setMentorTeams(teams)
      if (teams.length > 0 && !selectedTeam) {
        setSelectedTeam(teams[0])
      }
      loadedTabs.current.add('mentorTeams')
    } catch {
      toast.error('Failed to load assigned projects')
    } finally {
      setLoading(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    fetchAssignedTeams()
  }, [fetchAssignedTeams])

  const handleSelectProject = async (team) => {
    setSelectedProject(team)
    setSelectedTeam(team)
    setLoadingDetails(true)
    try {
      let nextSchedule = null
      try {
        const schedRes = await axiosInstance.get(`/schedules/team/${team._id}`)
        nextSchedule = schedRes.data.data
      } catch (e) {
        if (e?.response?.status !== 404) throw e
      }
      setSchedule(nextSchedule)

      if (nextSchedule?._id) {
        const subsRes = await axiosInstance.get(`/task-submissions/schedule/${nextSchedule._id}`)
        setSubmissions(subsRes.data.data || [])
      } else {
        setSubmissions([])
      }
    } catch {
      toast.error('Failed to load team details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const fetchTeamScheduleData = useCallback(async (team) => {
    if (!team?._id) return
    try {
      let nextSchedule = null
      try {
        const schedRes = await axiosInstance.get(`/schedules/team/${team._id}`)
        nextSchedule = schedRes.data.data
      } catch (e) {
        if (e?.response?.status !== 404) throw e
      }
      setSchedule(nextSchedule)

      if (nextSchedule?._id) {
        const subsRes = await axiosInstance.get(`/task-submissions/schedule/${nextSchedule._id}`)
        setSubmissions(subsRes.data.data || [])
      } else {
        setSubmissions([])
      }
    } catch {
      toast.error('Failed to load schedule data')
    }
  }, [])

  // Fetch schedule when selected team changes
  useEffect(() => {
    if (selectedTeam && (activeTab === 'tasks' || activeTab === 'grades')) {
      fetchTeamScheduleData(selectedTeam)
    }
  }, [selectedTeam, activeTab, fetchTeamScheduleData])

  const handleMentorReview = async (submissionId, payload) => {
    try {
      await axiosInstance.patch(`/task-submissions/${submissionId}/review`, payload)
      toast.success(payload.action === 'complete' ? 'Task marked complete!' : 'Task reassigned.')
      if (selectedTeam) fetchTeamScheduleData(selectedTeam)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Review failed')
    }
  }

  const submissionsMap = submissions.reduce((acc, s) => {
    acc[s.taskId] = s
    return acc
  }, {})

  const submittedCount = submissions.filter((s) => s.status === 'submitted').length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-heading border-t-transparent" />
      </div>
    )
  }

  const TABS = [
    { key: 'projects', label: 'Assigned Projects' },
    { key: 'tasks', label: 'Task Reviews', badge: submittedCount > 0 ? submittedCount : null },
    { key: 'grades', label: 'Grade Overview' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-heading">Mentor Dashboard</h2>
        <p className="text-sm text-secondary">Welcome, {user?.name}</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-btn text-ink'
                : 'bg-surface border border-line text-secondary hover:bg-surface-alt'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-neutral-900">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Assigned Projects (Teams) Tab */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h3 className="mb-3 text-base font-semibold text-body">Assigned Projects ({projects.length})</h3>
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-6 text-center backdrop-blur-sm">
                <p className="text-sm text-muted">No projects assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <button key={p._id} type="button" onClick={() => handleSelectProject(p)}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-lg ${selectedProject?._id === p._id ? 'border-line-focus bg-surface-alt' : 'border-line bg-surface hover:bg-surface-hover'} backdrop-blur-sm`}>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-heading truncate pr-2">{p.teamId}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-secondary">{p.branch}</span>
                      <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-secondary capitalize">{p.category}</span>
                    </div>
                    <p className="text-xs text-muted mt-1">{p.members?.length} member(s)</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            {!selectedProject ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-line bg-surface backdrop-blur-sm">
                <p className="text-sm text-muted">← Select a project to review</p>
              </div>
            ) : loadingDetails ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-line bg-surface backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-heading border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Team Info */}
                <div className="rounded-2xl border border-line bg-surface p-5 backdrop-blur-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono text-lg font-bold text-heading">{selectedProject.teamId}</h3>
                      <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-body">{selectedProject.branch}</span>
                      <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-body capitalize">{selectedProject.category}</span>
                    </div>
                    <StatusBadge status={selectedProject.status} />
                  </div>
                  <p className="text-xs text-muted mb-2">
                    <span className="font-medium text-body">Academic Year:</span> {selectedProject.academicYear}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(selectedProject.members || []).map((m, i) => (
                      <span key={i} className="rounded-full bg-surface border border-line px-2 py-1 text-xs text-body">
                        {m.name} <span className="font-mono text-muted">({m.rollNo})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Schedule / Tasks */}
                <div className="rounded-2xl border border-line bg-surface p-5 backdrop-blur-sm">
                  <h4 className="mb-3 text-base font-semibold text-label">Project Schedule</h4>
                  {!schedule ? (
                    <p className="text-sm text-muted">No project schedule uploaded for this team yet.</p>
                  ) : (
                    <div>
                      <p className="mb-3 text-sm font-medium text-heading">{schedule.title}</p>
                      {schedule.description && (
                        <p className="mb-3 text-xs text-secondary">{schedule.description}</p>
                      )}
                      <div className="space-y-2">
                        {[...(schedule.tasks || [])]
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((t, idx) => {
                            const sub = submissions.find((s) => s.taskId === t._id)
                            const statusColor = sub?.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : sub?.status === 'submitted'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-neutral-700 text-neutral-400'
                            return (
                              <div key={t._id} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
                                <div>
                                  <p className="text-sm text-label">Step {idx + 1}: {t.title}</p>
                                  <p className="text-xs text-muted">
                                    {new Date(t.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {new Date(t.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                  </p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor}`}>
                                  {sub?.status?.replace('_', ' ') || 'pending'}
                                </span>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Reviews Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {mentorTeams.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center backdrop-blur-sm">
              <p className="text-sm text-muted">No teams are assigned to you yet.</p>
            </div>
          ) : (
            <>
              {mentorTeams.length > 1 && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-secondary">Select Team:</label>
                  <select
                    value={selectedTeam?._id || ''}
                    onChange={(e) => {
                      const t = mentorTeams.find((tm) => tm._id === e.target.value)
                      setSelectedTeam(t || null)
                    }}
                    className="rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading outline-none focus:border-line-focus"
                  >
                    {mentorTeams.map((t) => (
                      <option key={t._id} value={t._id} className="bg-option">
                        {t.teamId} — {t.branch}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTeam && (
                <div className="space-y-4">
                  {/* Team info row */}
                  <div className="rounded-2xl border border-line bg-surface p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-heading">{selectedTeam.teamId}</span>
                      <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-body">{selectedTeam.branch}</span>
                      <span className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-body">{selectedTeam.category}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(selectedTeam.members || []).map((m, i) => (
                        <span key={i} className="rounded-full bg-surface border border-line px-2 py-1 text-xs text-body">
                          {m.name} <span className="font-mono text-muted">({m.rollNo})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Schedule tasks */}
                  {!schedule ? (
                    <div className="rounded-2xl border border-line bg-surface p-6 text-center backdrop-blur-sm">
                      <p className="text-sm text-muted">No project schedule uploaded for this team yet.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="mb-3 text-base font-semibold text-heading">{schedule.title}</h3>
                      <div className="space-y-3">
                        {[...(schedule.tasks || [])]
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((t) => (
                            <TaskReviewCard
                              key={t._id}
                              task={t}
                              submission={submissionsMap[t._id] || null}
                              teamMembers={selectedTeam.members || []}
                              onReview={handleMentorReview}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Grade Overview Tab */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {mentorTeams.length > 1 && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-secondary">Select Team:</label>
              <select
                value={selectedTeam?._id || ''}
                onChange={(e) => {
                  const t = mentorTeams.find((tm) => tm._id === e.target.value)
                  setSelectedTeam(t || null)
                }}
                className="rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading outline-none focus:border-line-focus"
              >
                {mentorTeams.map((t) => (
                  <option key={t._id} value={t._id} className="bg-option">
                    {t.teamId} — {t.branch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {schedule ? (
            <GradesOverview
              scheduleId={schedule._id}
              schedule={schedule}
              teamMembers={selectedTeam?.members || []}
            />
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center backdrop-blur-sm">
              <p className="text-sm text-muted">No schedule available for grade overview.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MentorDashboard