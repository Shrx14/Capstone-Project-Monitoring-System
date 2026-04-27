import { useState } from 'react'

const STATUS_MAP = {
  not_started: { label: 'Not Started', color: 'bg-neutral-700 text-neutral-300', border: 'border-l-neutral-500' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300', border: 'border-l-blue-500' },
  submitted: { label: '⏳ Awaiting Review', color: 'bg-yellow-500/20 text-yellow-300', border: 'border-l-yellow-500' },
  completed: { label: '✓ Completed', color: 'bg-emerald-500/20 text-emerald-300', border: 'border-l-emerald-500' },
  reassigned: { label: '⚠ Reassigned', color: 'bg-red-500/20 text-red-300', border: 'border-l-red-500' },
}

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function TaskCard({ task, submission, onOpenSubmitForm }) {
  const [showContribs, setShowContribs] = useState(false)
  const rawStatus = submission?.status || 'not_started'
  const statusInfo = STATUS_MAP[rawStatus] || STATUS_MAP.not_started

  return (
    <div className={`rounded-2xl border border-line bg-surface p-4 backdrop-blur-sm border-l-4 ${statusInfo.border}`}>
      {/* Header */}
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-heading">
          Step {(task.order ?? 0) + 1} — {task.title}
        </h4>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      {/* Date range */}
      <p className="mb-2 text-xs text-muted">
        From: {formatDate(task.fromDate)} → To: {formatDate(task.toDate)}
      </p>

      {/* Description */}
      {task.description && (
        <p className="mb-3 text-sm text-secondary">{task.description}</p>
      )}

      {/* Coordinator Files */}
      {task.attachments?.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-secondary">📎 Coordinator Files:</p>
          <div className="flex flex-wrap gap-2">
            {task.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-blue-300 hover:bg-surface-alt transition"
              >
                📄 {att.fileName || `File ${idx + 1}`}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Completed date */}
      {rawStatus === 'completed' && submission?.completedDate && (
        <p className="mb-2 text-xs text-emerald-300">
          ✓ Completed on: {formatDate(submission.completedDate)}
        </p>
      )}

      {/* Reassigned note */}
      {rawStatus === 'reassigned' && submission?.reassignNote && (
        <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <p className="mb-1 text-xs font-semibold text-red-300">⚠ Mentor's Reassignment Reason:</p>
          {submission.reassignNote}
        </div>
      )}

      {/* Mentor remarks */}
      {submission?.mentorRemarks && (
        <div className="mb-3 rounded-xl border border-line bg-surface p-3">
          <p className="mb-1 text-xs font-medium text-secondary">Mentor's Notes:</p>
          <p className="text-sm text-body">{submission.mentorRemarks}</p>
        </div>
      )}

      {/* Submitted files */}
      {submission?.files?.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-xs font-medium text-secondary">📎 Submitted Files:</p>
          <div className="flex flex-wrap gap-2">
            {submission.files.map((f, idx) => (
              <a
                key={idx}
                href={f.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-xs text-blue-300 hover:bg-surface-alt transition"
              >
                📄 {f.fileName || `File ${idx + 1}`}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Member Contributions */}
      {submission?.memberContributions?.length > 0 && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowContribs(!showContribs)}
            className="mb-1 text-xs font-medium text-secondary hover:text-heading transition"
          >
            {showContribs ? '▾' : '▸'} Member Contributions ({submission.memberContributions.length})
          </button>
          {showContribs && (
            <div className="space-y-1 rounded-xl border border-line bg-surface p-2">
              {submission.memberContributions.map((mc, idx) => (
                <div key={idx} className="rounded-lg bg-surface px-2 py-1.5">
                  <p className="text-xs font-medium text-label">
                    {mc.memberName} <span className="font-mono text-muted">({mc.rollNo})</span>
                  </p>
                  <p className="text-xs text-secondary">{mc.workDone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      <div className="flex justify-end">
        {rawStatus === 'completed' ? (
          <button
            type="button"
            disabled
            className="rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 cursor-default opacity-70"
          >
            ✓ Completed
          </button>
        ) : rawStatus === 'reassigned' ? (
          <button
            type="button"
            onClick={() => onOpenSubmitForm(task, submission)}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            ↩ Redo Task
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onOpenSubmitForm(task, submission)}
            className="rounded-lg bg-btn px-4 py-2 text-xs font-semibold text-ink transition hover:bg-btn-hover"
          >
            Update & Submit
          </button>
        )}
      </div>
    </div>
  )
}

export default TaskCard
