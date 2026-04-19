import { useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

const STATUS_OPTIONS = ['not_started', 'in_progress', 'completed']

function AllProjects({ projects, onStatusChange }) {
  const [updating, setUpdating] = useState({})

  const handleStatusChange = async (projectId, newStatus) => {
    setUpdating((prev) => ({ ...prev, [projectId]: true }))
    try {
      await axiosInstance.patch(`/projects/${projectId}/status`, { status: newStatus })
      toast.success('Status updated')
      onStatusChange()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating((prev) => ({ ...prev, [projectId]: false }))
    }
  }

  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        No projects found.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 tracking-wide">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Group</th>
            <th className="px-4 py-3">Mentor</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {projects.map((p) => (
            <tr key={p._id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-800">{p.title}</p>
                <p className="text-xs text-slate-400 truncate max-w-48">
                  {p.description?.slice(0, 80)}{p.description?.length > 80 ? '...' : ''}
                </p>
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {p.groupMembers?.join(', ')}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {p.mentorId?.name || '—'}
              </td>
              <td className="px-4 py-3">
                <select
                  value={p.status}
                  disabled={updating[p._id]}
                  onChange={(e) => handleStatusChange(p._id, e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-900 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AllProjects
