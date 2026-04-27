import { useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-300',
    approved: 'bg-emerald-500/20 text-emerald-300',
    rejected: 'bg-red-500/20 text-red-300',
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
    return <p className="py-4 text-sm text-muted">No progress updates for this project.</p>
  }

  return (
    <div className="space-y-4">
      {updates.map((u) => (
        <div key={u._id} className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-label">{u.submittedBy?.name}</p>
              <p className="text-xs text-muted">
                {new Date(u.createdAt).toLocaleString('en-GB', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <StatusBadge status={u.status} />
          </div>

          <p className="mb-2 max-h-32 overflow-y-auto text-sm text-body">{u.text}</p>

          {(u.fileAccessUrl || u.fileUrl) && (
            <a href={u.fileAccessUrl || u.fileUrl} target="_blank" rel="noreferrer" className="mb-2 block text-xs font-medium text-blue-400 hover:underline">
              📎 View Attachment
            </a>
          )}

          {u.status !== 'pending' && u.feedback && (
            <p className="mb-2 rounded-lg bg-surface p-2 text-xs text-secondary">
              <span className="font-medium text-body">Feedback:</span> {u.feedback}
            </p>
          )}

          {u.status === 'pending' && (
            <div className="mt-3 space-y-2">
              <textarea
                value={feedbacks[u._id] || ''}
                onChange={(e) => setFeedbacks((prev) => ({ ...prev, [u._id]: e.target.value }))}
                rows={2}
                placeholder="Add feedback (optional)..."
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2 text-xs text-heading placeholder-hint outline-none focus:border-line-focus focus:ring-1 focus:ring-accent"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading[u._id]}
                  onClick={() => handleReview(u._id, 'approved')}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition"
                >
                  {loading[u._id] ? '...' : '✓ Approve'}
                </button>
                <button
                  type="button"
                  disabled={loading[u._id]}
                  onClick={() => handleReview(u._id, 'rejected')}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition"
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
