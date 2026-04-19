import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'
import { useAuth } from '../../context/AuthContext'
import ProjectForm from '../../components/student/ProjectForm'
import UpdateForm from '../../components/student/UpdateForm'
import MilestoneForm from '../../components/student/MilestoneForm'

function StatusBadge({ status }) {
  const colors = {
    not_started: 'bg-neutral-700 text-neutral-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
    pending: 'bg-yellow-500/20 text-yellow-300',
    approved: 'bg-emerald-500/20 text-emerald-300',
    rejected: 'bg-red-500/20 text-red-300',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || 'bg-neutral-700 text-neutral-300'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

function Modal({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 hover:text-white text-xl font-bold transition"
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
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Welcome, {user?.name}</h2>
          <p className="text-sm text-neutral-400">Student Dashboard</p>
        </div>
        {!project && (
          <button
            type="button"
            onClick={() => setActiveModal('project')}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition"
          >
            + Create Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
            <h3 className="mb-3 text-lg font-semibold text-white">My Project</h3>
            {project ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-semibold text-neutral-100">{project.title}</h4>
                  <StatusBadge status={project.status} />
                </div>
                <p className="mb-3 text-sm text-neutral-400">{project.description}</p>
                <p className="mb-1 text-xs text-neutral-500">
                  <span className="font-medium text-neutral-300">Group Members:</span>{' '}
                  {project.groupMembers.join(', ')}
                </p>
                <p className="text-xs text-neutral-500">
                  <span className="font-medium text-neutral-300">Mentor:</span> {project.mentorId?.name}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal('update')}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 hover:bg-neutral-200 transition"
                  >
                    Submit Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal('milestone')}
                    className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                  >
                    Manage Milestones
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-neutral-500">No project yet.</p>
                <button
                  type="button"
                  onClick={() => setActiveModal('project')}
                  className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition"
                >
                  Create Your Project
                </button>
              </div>
            )}
          </div>

          {/* Updates */}
          {project && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
              <h3 className="mb-3 text-lg font-semibold text-white">Progress Updates</h3>
              {updates.length === 0 ? (
                <p className="text-sm text-neutral-500">No updates submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {updates.map((u) => (
                    <div key={u._id} className="rounded-xl border border-white/5 bg-white/5 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <StatusBadge status={u.status} />
                        <span className="text-xs text-neutral-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-300">{u.text}</p>
                      {u.feedback && (
                        <p className="mt-1 text-xs text-neutral-500">
                          <span className="font-medium text-neutral-400">Feedback:</span> {u.feedback}
                        </p>
                      )}
                      {(u.fileAccessUrl || u.fileUrl) && (
                        <a
                          href={u.fileAccessUrl || u.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs text-blue-400 hover:underline"
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
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
          <h3 className="mb-3 text-lg font-semibold text-white">Announcements</h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-neutral-500">No announcements yet.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a._id} className="border-b border-white/5 pb-3 last:border-0">
                  <p className="text-sm text-neutral-300">{a.message}</p>
                  <p className="mt-1 text-xs text-neutral-500">
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