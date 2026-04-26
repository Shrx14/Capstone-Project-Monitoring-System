import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import ReviewUpdate from '../../components/mentor/ReviewUpdate'
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

  // Existing state
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [updates, setUpdates] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // New state for task review / grades tabs
  const [mentorTeams, setMentorTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [submissions, setSubmissions] = useState([])

  const loadedTabs = useRef(new Set())

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/projects/assigned')
      setProjects(res.data.data || [])
    } catch {
      toast.error('Failed to load assigned projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleSelectProject = async (project) => {
    setSelectedProject(project)
    setLoadingDetails(true)
    try {
      const [updRes, milRes] = await Promise.all([
        axiosInstance.get(`/updates/project/${project._id}`),
        axiosInstance.get(`/milestones/project/${project._id}`),
      ])
      setUpdates(updRes.data.data || [])
      setMilestones(milRes.data.data || [])
    } catch {
      toast.error('Failed to load project details')
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleReviewComplete = () => {
    if (selectedProject) handleSelectProject(selectedProject)
  }

  // Fetch mentor teams data
  const fetchMentorTeamData = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/teams/mentor-teams')
      const teams = res.data.data || []
      setMentorTeams(teams)
      if (teams.length > 0 && !selectedTeam) {
        setSelectedTeam(teams[0])
      }
    } catch {
      toast.error('Failed to load assigned teams')
    }
  }, [selectedTeam])

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

  // Lazy load task/grade tab data
  useEffect(() => {
    if ((activeTab === 'tasks' || activeTab === 'grades') && !loadedTabs.current.has('mentorTeams')) {
      loadedTabs.current.add('mentorTeams')
      fetchMentorTeamData()
    }
  }, [activeTab, fetchMentorTeamData])

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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
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
        <h2 className="text-2xl font-bold text-white">Mentor Dashboard</h2>
        <p className="text-sm text-neutral-400">Welcome, {user?.name}</p>
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
                ? 'bg-white text-neutral-900'
                : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
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

      {/* Projects Tab (existing content unchanged) */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h3 className="mb-3 text-base font-semibold text-neutral-300">Assigned Projects ({projects.length})</h3>
            {projects.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
                <p className="text-sm text-neutral-500">No projects assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((p) => (
                  <button key={p._id} type="button" onClick={() => handleSelectProject(p)}
                    className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-lg ${selectedProject?._id === p._id ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/8'} backdrop-blur-sm`}>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-100 truncate pr-2">{p.title}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="text-xs text-neutral-500">{p.groupMembers?.length} member(s)</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-2">
            {!selectedProject ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 backdrop-blur-sm">
                <p className="text-sm text-neutral-500">← Select a project to review</p>
              </div>
            ) : loadingDetails ? (
              <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{selectedProject.title}</h3>
                    <StatusBadge status={selectedProject.status} />
                  </div>
                  <p className="mb-3 text-sm text-neutral-400">{selectedProject.description}</p>
                  <p className="text-xs text-neutral-500">
                    <span className="font-medium text-neutral-300">Group:</span> {selectedProject.groupMembers?.join(', ')}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="mb-3 text-base font-semibold text-neutral-200">Milestones</h4>
                  {milestones.length === 0 ? (
                    <p className="text-sm text-neutral-500">No milestones set.</p>
                  ) : (
                    <div className="space-y-2">
                      {milestones.map((m) => (
                        <div key={m._id} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                          <div>
                            <p className="text-sm text-neutral-200">{m.title}</p>
                            <p className="text-xs text-neutral-500">Due: {new Date(m.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <h4 className="mb-3 text-base font-semibold text-neutral-200">Progress Updates ({updates.length})</h4>
                  <ReviewUpdate updates={updates} onReviewComplete={handleReviewComplete} />
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
              <p className="text-sm text-neutral-500">No teams are assigned to you yet.</p>
            </div>
          ) : (
            <>
              {mentorTeams.length > 1 && (
                <div className="flex items-center gap-3">
                  <label className="text-sm text-neutral-400">Select Team:</label>
                  <select
                    value={selectedTeam?._id || ''}
                    onChange={(e) => {
                      const t = mentorTeams.find((tm) => tm._id === e.target.value)
                      setSelectedTeam(t || null)
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                  >
                    {mentorTeams.map((t) => (
                      <option key={t._id} value={t._id} className="bg-neutral-900">
                        {t.teamId} — {t.branch}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedTeam && (
                <div className="space-y-4">
                  {/* Team info row */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-lg font-bold text-white">{selectedTeam.teamId}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-300">{selectedTeam.branch}</span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-neutral-300">{selectedTeam.category}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(selectedTeam.members || []).map((m, i) => (
                        <span key={i} className="rounded-full bg-white/5 border border-white/10 px-2 py-1 text-xs text-neutral-300">
                          {m.name} <span className="font-mono text-neutral-500">({m.rollNo})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Schedule tasks */}
                  {!schedule ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
                      <p className="text-sm text-neutral-500">No project schedule uploaded for this team yet.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="mb-3 text-base font-semibold text-white">{schedule.title}</h3>
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
              <label className="text-sm text-neutral-400">Select Team:</label>
              <select
                value={selectedTeam?._id || ''}
                onChange={(e) => {
                  const t = mentorTeams.find((tm) => tm._id === e.target.value)
                  setSelectedTeam(t || null)
                }}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              >
                {mentorTeams.map((t) => (
                  <option key={t._id} value={t._id} className="bg-neutral-900">
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
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
              <p className="text-sm text-neutral-500">No schedule available for grade overview.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MentorDashboard