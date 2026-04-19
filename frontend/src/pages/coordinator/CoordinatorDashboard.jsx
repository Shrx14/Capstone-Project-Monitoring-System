import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import AllProjects from '../../components/coordinator/AllProjects'
import AnnouncementForm from '../../components/coordinator/AnnouncementForm'

const FILTERS = ['all', 'not_started', 'in_progress', 'completed']

function StatCard({ label, count, color }) {
  const colors = {
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{count}</p>
      <p className="mt-1 text-sm font-medium capitalize">{label.replace('_', ' ')}</p>
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-900">Coordinator Dashboard</h2>
        <p className="text-sm text-slate-500">Welcome, {user?.name}</p>
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
                    ? 'bg-blue-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-400">{filteredProjects.length} project(s)</span>
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