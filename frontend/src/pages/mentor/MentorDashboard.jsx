import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import ReviewUpdate from '../../components/mentor/ReviewUpdate'

function StatusBadge({ status }) {
  const colors = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

function MentorDashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [updates, setUpdates] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)

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
        <h2 className="text-2xl font-bold text-blue-900">Mentor Dashboard</h2>
        <p className="text-sm text-slate-500">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Project List */}
        <div className="lg:col-span-1">
          <h3 className="mb-3 text-base font-semibold text-slate-700">Assigned Projects ({projects.length})</h3>
          {projects.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
              <p className="text-sm text-slate-500">No projects assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleSelectProject(p)}
                  className={`w-full rounded-xl border p-4 text-left transition hover:shadow-md ${
                    selectedProject?._id === p._id
                      ? 'border-blue-900 bg-blue-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 truncate pr-2">{p.title}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-slate-500">{p.groupMembers?.length} member(s)</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Project Detail */}
        <div className="lg:col-span-2">
          {!selectedProject ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
              <p className="text-sm text-slate-400">← Select a project to review</p>
            </div>
          ) : loadingDetails ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-900 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Project Info */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-blue-900">{selectedProject.title}</h3>
                  <StatusBadge status={selectedProject.status} />
                </div>
                <p className="mb-3 text-sm text-slate-600">{selectedProject.description}</p>
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Group:</span> {selectedProject.groupMembers?.join(', ')}
                </p>
              </div>

              {/* Milestones */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-base font-semibold text-slate-700">Milestones</h4>
                {milestones.length === 0 ? (
                  <p className="text-sm text-slate-500">No milestones set.</p>
                ) : (
                  <div className="space-y-2">
                    {milestones.map((m) => (
                      <div key={m._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <div>
                          <p className="text-sm text-slate-800">{m.title}</p>
                          <p className="text-xs text-slate-400">
                            Due: {new Date(m.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${m.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Updates */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="mb-3 text-base font-semibold text-slate-700">
                  Progress Updates ({updates.length})
                </h4>
                <ReviewUpdate updates={updates} onReviewComplete={handleReviewComplete} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MentorDashboard