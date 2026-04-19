import { useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status]}`}>
      {status}
    </span>
  )
}

function ReviewUpdate({ updates, onReviewComplete }) {
  const [feedbacks, setFeedbacks] = useState({})
  const [loading, setLoading] = useState({})

  const handleReview = async (updateId, status) => {
    setLoading((prev) => ({ ...prev, [updateId]: true }))
    try {
      await axiosInstance.patch(`/updates/${updateId}/review`, {
        status,
        feedback: feedbacks[updateId] || '',
      })
      toast.success(`Update ${status} successfully`)
      onReviewComplete()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Review failed')
    } finally {
      setLoading((prev) => ({ ...prev, [updateId]: false }))
    }
  }

  if (updates.length === 0) {
    return <p className="py-4 text-sm text-slate-500">No progress updates for this project.</p>
  }

  return (
    <div className="space-y-4">
      {updates.map((u) => (
        <div key={u._id} className="rounded-lg border border-slate-200 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">{u.submittedBy?.name}</p>
              <p className="text-xs text-slate-400">
                {new Date(u.createdAt).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <StatusBadge status={u.status} />
          </div>

          <p className="mb-2 max-h-32 overflow-y-auto text-sm text-slate-700">{u.text}</p>

          {u.fileUrl && (
            <a
              href={u.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mb-2 block text-xs font-medium text-blue-600 hover:underline"
            >
              📎 View Attachment
            </a>
          )}

          {u.status !== 'pending' && u.feedback && (
            <p className="mb-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">
              <span className="font-medium">Feedback:</span> {u.feedback}
            </p>
          )}

          {u.status === 'pending' && (
            <div className="mt-3 space-y-2">
              <textarea
                value={feedbacks[u._id] || ''}
                onChange={(e) =>
                  setFeedbacks((prev) => ({ ...prev, [u._id]: e.target.value }))
                }
                rows={2}
                placeholder="Add feedback (optional)..."
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading[u._id]}
                  onClick={() => handleReview(u._id, 'approved')}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                >
                  {loading[u._id] ? '...' : '✓ Approve'}
                </button>
                <button
                  type="button"
                  disabled={loading[u._id]}
                  onClick={() => handleReview(u._id, 'rejected')}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {loading[u._id] ? '...' : '✕ Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ReviewUpdate
