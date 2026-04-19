import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import AllProjects from '../../components/coordinator/AllProjects'
import AnnouncementForm from '../../components/coordinator/AnnouncementForm'

const FILTERS = ['all', 'not_started', 'in_progress', 'completed']

function StatCard({ label, count, color }) {
  const colors = {
    gray: 'bg-white/5 border-white/10 text-neutral-300',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
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
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({ not_started: 0, in_progress: 0, completed: 0 })
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

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

  const filteredProjects =
    activeFilter === 'all' ? projects : projects.filter((p) => p.status === activeFilter)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Coordinator Dashboard</h2>
        <p className="text-sm text-neutral-400">Welcome, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatCard label="Not Started" count={stats.not_started} color="gray" />
        <StatCard label="In Progress" count={stats.in_progress} color="blue" />
        <StatCard label="Completed" count={stats.completed} color="green" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Projects Table */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  activeFilter === f
                    ? 'bg-white text-neutral-900'
                    : 'bg-white/5 border border-white/10 text-neutral-400 hover:bg-white/10'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
            <span className="ml-auto text-xs text-neutral-500">{filteredProjects.length} project(s)</span>
          </div>
          <AllProjects projects={filteredProjects} onStatusChange={fetchAll} />
        </div>

        {/* Announcements */}
        <div className="lg:col-span-1">
          <AnnouncementForm announcements={announcements} onPosted={fetchAll} />
        </div>
      </div>
    </div>
  )
}

export default CoordinatorDashboard