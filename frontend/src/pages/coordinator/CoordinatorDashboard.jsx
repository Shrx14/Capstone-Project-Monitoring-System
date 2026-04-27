import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import AllProjects from '../../components/coordinator/AllProjects'
import AnnouncementForm from '../../components/coordinator/AnnouncementForm'
import TeamApprovalCard from '../../components/coordinator/TeamApprovalCard'
import ScheduleUploadForm from '../../components/coordinator/ScheduleUploadForm'

const FILTERS = ['all', 'not_started', 'in_progress', 'completed']
const TEAM_FILTERS = ['all', 'pending', 'approved', 'rejected']

function StatCard({ label, count, color }) {
  const colors = {
    gray: 'bg-surface border-line text-body',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300',
    red: 'bg-red-500/10 border-red-500/20 text-red-300',
  }
  return (
    <div className={`rounded-2xl border p-5 backdrop-blur-sm ${colors[color]}`}>
      <p className="text-3xl font-bold">{count}</p>
      <p className="mt-1 text-sm font-medium capitalize opacity-70">{label.replace('_', ' ')}</p>
    </div>
  )
}

function CoordinatorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // Overview state
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({ not_started: 0, in_progress: 0, completed: 0 })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  // Team Management state
  const [teams, setTeams] = useState([])
  const [mentors, setMentors] = useState([])
  const [teamStats, setTeamStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [teamFilter, setTeamFilter] = useState('all')

  // Schedule state
  const [schedules, setSchedules] = useState([])
  const [approvedTeams, setApprovedTeams] = useState([])
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [expandedSchedule, setExpandedSchedule] = useState(null)

  const loadedTabs = useRef(new Set())

  const fetchAll = useCallback(async () => {
    try {
      const [projRes, statsRes, annRes] = await Promise.all([
        axiosInstance.get('/projects'),
        axiosInstance.get('/projects/stats'),
        axiosInstance.get('/announcements'),
      ])
      setProjects(projRes.data.data || [])
      setStats(statsRes.data.data || { not_started: 0, in_progress: 0, completed: 0 })
      setAnnouncements(annRes.data.data || [])
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Lazy load team tab data
  useEffect(() => {
    if (activeTab === 'teams' && !loadedTabs.current.has('teams')) {
      const load = async () => {
        try {
          const [teamsRes, statsRes] = await Promise.all([
            axiosInstance.get('/teams'),
            axiosInstance.get('/teams/stats'),
          ])
          setTeams(teamsRes.data.data || [])
          setTeamStats(statsRes.data.data || { pending: 0, approved: 0, rejected: 0, total: 0 })

          // Fetch mentors (users with role=mentor)
          const mentorRes = await axiosInstance.get('/users?role=mentor')
          setMentors(mentorRes.data.data || [])
          loadedTabs.current.add('teams')
        } catch {
          toast.error('Failed to load team data')
        }
      }
      load()
    }
  }, [activeTab])

  // Lazy load schedules tab data
  useEffect(() => {
    if (activeTab === 'schedules' && !loadedTabs.current.has('schedules')) {
      const load = async () => {
        try {
          const [schedRes, teamsRes] = await Promise.all([
            axiosInstance.get('/schedules'),
            axiosInstance.get('/teams?status=approved'),
          ])
          setSchedules(schedRes.data.data || [])
          setApprovedTeams(teamsRes.data.data || [])
          loadedTabs.current.add('schedules')
        } catch {
          toast.error('Failed to load schedules')
        }
      }
      load()
    }
  }, [activeTab])

  const handleApprove = async (teamDocId, mentorId) => {
    try {
      await axiosInstance.patch(`/teams/${teamDocId}/approve`, { mentorId })
      toast.success('Team approved and mentor assigned!')
      const [teamsRes, statsRes] = await Promise.all([
        axiosInstance.get('/teams'),
        axiosInstance.get('/teams/stats'),
      ])
      setTeams(teamsRes.data.data || [])
      setTeamStats(statsRes.data.data || { pending: 0, approved: 0, rejected: 0, total: 0 })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to approve team')
    }
  }

  const handleReject = async (teamDocId, reason) => {
    try {
      await axiosInstance.patch(`/teams/${teamDocId}/reject`, { rejectionReason: reason })
      toast.success('Team rejected.')
      const [teamsRes, statsRes] = await Promise.all([
        axiosInstance.get('/teams'),
        axiosInstance.get('/teams/stats'),
      ])
      setTeams(teamsRes.data.data || [])
      setTeamStats(statsRes.data.data || { pending: 0, approved: 0, rejected: 0, total: 0 })
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reject team')
    }
  }

  const filteredProjects =
    activeFilter === 'all' ? projects : projects.filter((p) => p.status === activeFilter)

  const filteredTeams =
    teamFilter === 'all' ? teams : teams.filter((t) => t.status === teamFilter)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-heading border-t-transparent" />
      </div>
    )
  }

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'teams', label: 'Team Management' },
    { key: 'schedules', label: 'Project Schedules' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-heading">Coordinator Dashboard</h2>
        <p className="text-sm text-secondary">Welcome, {user?.name}</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeTab === tab.key
                ? 'bg-btn text-ink'
                : 'bg-surface border border-line text-secondary hover:bg-surface-alt'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <StatCard label="Not Started" count={stats.not_started} color="gray" />
            <StatCard label="In Progress" count={stats.in_progress} color="blue" />
            <StatCard label="Completed" count={stats.completed} color="green" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                {FILTERS.map((f) => (
                  <button key={f} type="button" onClick={() => setActiveFilter(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${activeFilter === f ? 'bg-btn text-ink' : 'bg-surface border border-line text-secondary hover:bg-surface-alt'}`}>{f.replace('_', ' ')}</button>
                ))}
                <span className="ml-auto text-xs text-muted">{filteredProjects.length} project(s)</span>
              </div>
              <AllProjects projects={filteredProjects} onStatusChange={fetchAll} />
            </div>
            <div className="lg:col-span-1">
              <AnnouncementForm announcements={announcements} onPosted={fetchAll} />
            </div>
          </div>
        </>
      )}

      {/* Team Management Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Pending" count={teamStats.pending} color="yellow" />
            <StatCard label="Approved" count={teamStats.approved} color="green" />
            <StatCard label="Rejected" count={teamStats.rejected} color="red" />
          </div>
          <div className="flex items-center gap-2">
            {TEAM_FILTERS.map((f) => (
              <button key={f} type="button" onClick={() => setTeamFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${teamFilter === f ? 'bg-btn text-ink' : 'bg-surface border border-line text-secondary hover:bg-surface-alt'}`}>{f}</button>
            ))}
            <span className="ml-auto text-xs text-muted">{filteredTeams.length} team(s)</span>
          </div>
          {filteredTeams.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center backdrop-blur-sm"><p className="text-sm text-muted">No teams found.</p></div>
          ) : (
            <div className="space-y-4">
              {filteredTeams.map((t) => (
                <TeamApprovalCard key={t._id} team={t} mentors={mentors} onApprove={handleApprove} onReject={handleReject} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Schedules Tab */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-heading">Project Schedules</h3>
            <button type="button" onClick={() => setShowUploadForm(!showUploadForm)}
              className="rounded-lg bg-btn px-4 py-2 text-sm font-semibold text-ink transition hover:bg-btn-hover">
              {showUploadForm ? 'Cancel' : '+ Upload New Schedule'}
            </button>
          </div>

          {showUploadForm && (
            <div className="rounded-2xl border border-line bg-surface p-5 backdrop-blur-sm">
              <ScheduleUploadForm teams={approvedTeams} onSuccess={() => {
                setShowUploadForm(false)
                axiosInstance.get('/schedules').then((r) => setSchedules(r.data.data || []))
              }} />
            </div>
          )}

          {schedules.length === 0 && !showUploadForm ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-center backdrop-blur-sm"><p className="text-sm text-muted">No schedules uploaded yet.</p></div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s) => (
                <div key={s._id} className="rounded-2xl border border-line bg-surface p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedSchedule(expandedSchedule === s._id ? null : s._id)}>
                    <div>
                      <h4 className="text-sm font-semibold text-heading">{s.title}</h4>
                      <p className="text-xs text-muted">
                        Team: {s.teamId?.teamId || 'N/A'} · {s.tasks?.length || 0} tasks
                      </p>
                    </div>
                    <span className="text-xs text-muted">{expandedSchedule === s._id ? '▾' : '▸'}</span>
                  </div>
                  {expandedSchedule === s._id && (
                    <div className="mt-3 space-y-2 border-t border-line pt-3">
                      {(s.tasks || []).map((t, idx) => (
                        <div key={t._id} className="rounded-lg bg-surface px-3 py-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-label">Step {idx + 1}: {t.title}</span>
                            <span className="text-xs text-muted">
                              {new Date(t.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {new Date(t.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                              {t.attachments?.length > 0 && ` · ${t.attachments.length} file(s)`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CoordinatorDashboard