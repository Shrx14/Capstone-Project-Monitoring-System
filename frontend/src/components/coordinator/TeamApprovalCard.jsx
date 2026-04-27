import { useState } from 'react'

const categoryColors = {
  internal: 'bg-blue-500/20 text-blue-300',
  external: 'bg-purple-500/20 text-purple-300',
  interdisciplinary: 'bg-orange-500/20 text-orange-300',
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
}

const borderLeftColor = {
  pending: 'border-l-yellow-500',
  approved: 'border-l-emerald-500',
  rejected: 'border-l-red-500',
}

function TeamApprovalCard({ team, mentors, onApprove, onReject }) {
  const [selectedMentorId, setSelectedMentorId] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleApprove = async () => {
    if (!selectedMentorId) return
    setActionLoading(true)
    try {
      await onApprove(team._id, selectedMentorId)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (rejectionReason.trim().length < 10) return
    setActionLoading(true)
    try {
      await onReject(team._id, rejectionReason)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className={`rounded-2xl border border-line bg-surface p-5 backdrop-blur-sm border-l-4 ${borderLeftColor[team.status] || borderLeftColor.pending}`}>
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-mono text-lg font-bold text-heading">{team.teamId}</h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${categoryColors[team.category] || 'bg-surface-alt text-body'}`}>
            {team.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[team.status] || statusColors.pending}`}>
            {team.status}
          </span>
          <span className="text-xs text-muted">
            {new Date(team.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Info rows */}
      <div className="mb-3 space-y-1 text-sm text-body">
        <p>
          <span className="text-muted">Team Leader:</span>{' '}
          <span className="font-medium">{team.teamLeaderId?.name}</span>{' '}
          <span className="text-xs text-muted">({team.teamLeaderId?.email})</span>
          {team.teamLeaderId?.rollNo && (
            <span className="ml-1 text-xs text-muted">Roll: {team.teamLeaderId.rollNo}</span>
          )}
        </p>
        <p>
          <span className="text-muted">Department:</span> {team.branch}
          <span className="mx-2 text-faint">|</span>
          <span className="text-muted">Academic Year:</span> {team.academicYear}
        </p>
      </div>

      {/* Members table */}
      <div className="mb-4 overflow-hidden rounded-xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-alt">
            <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Roll No</th>
              <th className="px-3 py-2">Branch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(team.members || []).map((m, i) => (
              <tr key={m.rollNo || i} className="text-body">
                <td className="px-3 py-2 text-muted">{i + 1}</td>
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{m.rollNo}</td>
                <td className="px-3 py-2 text-xs">{m.branch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending actions */}
      {team.status === 'pending' && (
        <div className="space-y-4">
          {/* Approve section */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="mb-2 text-sm font-semibold text-body">Assign Mentor & Approve</p>
            <div className="flex gap-2">
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="flex-1 rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading outline-none focus:border-line-focus"
              >
                <option value="" className="bg-option">-- Select a Mentor --</option>
                {(mentors || []).map((m) => (
                  <option key={m._id} value={m._id} className="bg-option">
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!selectedMentorId || actionLoading}
                onClick={handleApprove}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading ? '...' : 'Approve & Assign'}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-muted">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          {/* Reject section */}
          {!showRejectForm ? (
            <button
              type="button"
              onClick={() => setShowRejectForm(true)}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              Reject Team
            </button>
          ) : (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Reason for rejection (minimum 10 characters)..."
                className="mb-2 w-full rounded-lg border border-red-500/20 bg-input-bg px-3 py-2 text-sm text-heading placeholder-hint outline-none focus:border-red-500/40"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={rejectionReason.trim().length < 10 || actionLoading}
                  onClick={handleReject}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? '...' : 'Confirm Rejection'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectionReason('')
                  }}
                  className="text-sm text-secondary hover:text-heading transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approved banner */}
      {team.status === 'approved' && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          ✓ Approved — Mentor: {team.mentorId?.name || 'assigned'}
        </div>
      )}

      {/* Rejected banner */}
      {team.status === 'rejected' && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          ✗ Rejected — Reason: {team.rejectionReason}
        </div>
      )}
    </div>
  )
}

export default TeamApprovalCard
