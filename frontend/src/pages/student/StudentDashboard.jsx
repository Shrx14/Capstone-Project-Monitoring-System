import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import ProjectForm from '../../components/student/ProjectForm'
import UpdateForm from '../../components/student/UpdateForm'
import MilestoneForm from '../../components/student/MilestoneForm'

function StatusBadge({ status }) {
  const colors = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

function StudentDashboard() {
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [updates, setUpdates] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [projRes, annRes] = await Promise.all([
        axiosInstance.get('/projects/my'),
        axiosInstance.get('/announcements'),
      ])
      const myProject = projRes.data.data?.[0] || null
      setProject(myProject)
      setAnnouncements(annRes.data.data || [])

      if (myProject) {
        const updRes = await axiosInstance.get(`/updates/project/${myProject._id}`)
        setUpdates(updRes.data.data || [])
      }
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleModalClose = () => setActiveModal(null)
  const handleSuccess = () => {
    setActiveModal(null)
    fetchData()
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Welcome, {user?.name}</h2>
          <p className="text-sm text-slate-500">Student Dashboard</p>
        </div>
        {!project && (
          <button
            type="button"
            onClick={() => setActiveModal('project')}
            className="rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            + Create Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold text-blue-900">My Project</h3>
            {project ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-800">{project.title}</h4>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mb-3 text-sm text-slate-600">{project.description}</p>
                <p className="mb-1 text-xs text-slate-500">
                  <span className="font-medium">Group Members:</span>{' '}
                  {project.groupMembers.join(', ')}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-medium">Mentor:</span> {project.mentorId?.name}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal('update')}
                    className="rounded-md bg-blue-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800"
                  >
                    Submit Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('milestone')}
                    className="rounded-md border border-blue-900 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50"
                  >
                    Manage Milestones
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-slate-500">No project yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveModal('project')}
                  className="mt-3 rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Create Your Project
                </button>
              </div>
            )}
          </div>

          {/* Updates */}
          {project && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-blue-900">Progress Updates</h3>
              {updates.length === 0 ? (
                <p className="text-sm text-slate-500">No updates submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {updates.map((u) => (
                    <div key={u._id} className="rounded-lg border border-slate-100 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <StatusBadge status={u.status} />
                        <span className="text-xs text-slate-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{u.text}</p>
                      {u.feedback && (
                        <p className="mt-1 text-xs text-slate-500">
                          <span className="font-medium">Feedback:</span> {u.feedback}
                        </p>
                      )}
                      {u.fileUrl && (
                        <a
                          href={u.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs text-blue-600 hover:underline"
                        >
                          View Attachment
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column — Announcements */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-semibold text-blue-900">Announcements</h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-slate-500">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a._id} className="border-b border-slate-100 pb-3 last:border-0">
                  <p className="text-sm text-slate-700">{a.message}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(a.date).toLocaleDateString()} · {a.createdBy?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'project' && (
        <Modal onClose={handleModalClose}>
          <ProjectForm onClose={handleModalClose} onSuccess={handleSuccess} />
        </Modal>
      )}
      {activeModal === 'update' && project && (
        <Modal onClose={handleModalClose}>
          <UpdateForm projectId={project._id} onClose={handleModalClose} onSuccess={handleSuccess} />
        </Modal>
      )}
      {activeModal === 'milestone' && project && (
        <Modal onClose={handleModalClose}>
          <MilestoneForm projectId={project._id} onClose={handleModalClose} onSuccess={handleSuccess} />
        </Modal>
      )}
    </div>
  )
}

export default StudentDashboard