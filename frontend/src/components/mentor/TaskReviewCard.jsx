import { useState } from 'react'
import { toast } from 'react-toastify'

const STATUS_MAP = {
  not_started: { label: 'Not Started', color: 'bg-neutral-700 text-neutral-300' },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-300' },
  submitted: { label: '⏳ Awaiting Review', color: 'bg-yellow-500/20 text-yellow-300' },
  completed: { label: '✓ Completed', color: 'bg-emerald-500/20 text-emerald-300' },
  reassigned: { label: '⚠ Reassigned', color: 'bg-red-500/20 text-red-300' },
}

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function TaskReviewCard({ task, submission, teamMembers, onReview }) {
  const [action, setAction] = useState('complete')
  const [mentorRemarks, setMentorRemarks] = useState('')
  const [reassignNote, setReassignNote] = useState('')
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0])
  const [grades, setGrades] = useState(
    (teamMembers || []).map((m) => ({ memberName: m.name, rollNo: m.rollNo, grade: '', remarks: '' }))
  )
  const [submitting, setSubmitting] = useState(false)

  const statusInfo = STATUS_MAP[submission?.status] || STATUS_MAP.not_started

  const updateGrade = (idx, field, value) => {
    setGrades((prev) => prev.map((g, i) => (i === idx ? { ...g, [field]: value } : g)))
  }

  const handleSubmitReview = async () => {
    if (action === 'complete') {
      const missing = grades.some((g) => !g.grade.trim())
      if (missing) return toast.error('Please enter a grade for all members')
    }
    if (action === 'reassign' && reassignNote.trim().length < 10) {
      return toast.error('Reassign note must be at least 10 characters')
    }
    setSubmitting(true)
    try {
      await onReview(submission._id, {
        action, mentorRemarks, reassignNote, completedDate,
        grades: action === 'complete' ? grades : [],
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-heading">Step {(task.order ?? 0) + 1} — {task.title}</h4>
          <p className="text-xs text-muted">{formatDate(task.fromDate)} → {formatDate(task.toDate)}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
      </div>

      {task.description && <p className="mb-3 text-sm text-secondary">{task.description}</p>}

      {!submission && <p className="text-sm text-muted">Not started by team yet.</p>}

      {submission && (
        <div className="space-y-3">
          {submission.statusNote && (
            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="mb-1 text-xs font-medium text-secondary">Team's Progress Note</p>
              <p className="text-sm text-body">{submission.statusNote}</p>
            </div>
          )}

          {submission.memberContributions?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-secondary">Member Contributions</p>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface-alt">
                    <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
                      <th className="px-3 py-2">Name</th><th className="px-3 py-2">Roll No</th><th className="px-3 py-2">Work Done</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {submission.memberContributions.map((mc, i) => (
                      <tr key={i} className="text-body">
                        <td className="px-3 py-2">{mc.memberName}</td>
                        <td className="px-3 py-2 font-mono text-xs">{mc.rollNo}</td>
                        <td className="px-3 py-2 text-xs">{mc.workDone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {submission.files?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-secondary">Submitted Files</p>
              <div className="flex flex-wrap gap-2">
                {submission.files.map((f, i) => (
                  <a key={i} href={f.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-line bg-surface px-2 py-1 text-xs text-blue-300 hover:bg-surface-alt transition">📎 {f.fileName}</a>
                ))}
              </div>
            </div>
          )}

          {task.attachments?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-secondary">Coordinator's Task Files</p>
              <div className="flex flex-wrap gap-2">
                {task.attachments.map((a, i) => (
                  <a key={i} href={a.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-line bg-surface px-2 py-1 text-xs text-blue-300 hover:bg-surface-alt transition">📎 {a.fileName}</a>
                ))}
              </div>
            </div>
          )}

          {submission.mentorRemarks && (
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
              <p className="mb-1 text-xs font-medium text-yellow-300">Previous Remarks</p>
              <p className="text-sm text-body">{submission.mentorRemarks}</p>
            </div>
          )}

          {submission.reassignNote && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
              <p className="mb-1 text-xs font-medium text-red-300">Reassign Reason</p>
              <p className="text-sm text-body">{submission.reassignNote}</p>
            </div>
          )}

          {/* Completed view */}
          {submission.status === 'completed' && (
            <>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                ✓ Completed on {submission.completedDate ? formatDate(submission.completedDate) : 'N/A'}
              </div>
              {submission.grades?.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-secondary">Grades (confidential)</p>
                  <div className="overflow-hidden rounded-xl border border-line">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-line bg-surface-alt"><tr className="text-xs font-semibold uppercase tracking-wide text-muted"><th className="px-3 py-2">Name</th><th className="px-3 py-2">Roll</th><th className="px-3 py-2">Grade</th><th className="px-3 py-2">Remarks</th></tr></thead>
                      <tbody className="divide-y divide-line">
                        {submission.grades.map((g, i) => (
                          <tr key={i} className="text-body"><td className="px-3 py-2">{g.memberName}</td><td className="px-3 py-2 font-mono text-xs">{g.rollNo}</td><td className="px-3 py-2 font-bold">{g.grade}</td><td className="px-3 py-2 text-xs">{g.remarks || '—'}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-1 text-xs text-muted">🎓 Grades are confidential — not visible to the team</p>
                </div>
              )}
            </>
          )}

          {submission.status === 'reassigned' && (
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-300">Reassigned — waiting for team to resubmit</div>
          )}

          {/* Review form for submitted tasks */}
          {submission.status === 'submitted' && (
            <div className="space-y-3 rounded-xl border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-heading">Review This Task</p>
              <div className="flex gap-3">
                <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${action === 'complete' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-line text-secondary'}`}>
                  <input type="radio" name="action" value="complete" checked={action === 'complete'} onChange={() => setAction('complete')} className="hidden" />
                  ✓ Mark as Completed
                </label>
                <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${action === 'reassign' ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-line text-secondary'}`}>
                  <input type="radio" name="action" value="reassign" checked={action === 'reassign'} onChange={() => setAction('reassign')} className="hidden" />
                  ↩ Reassign to Team
                </label>
              </div>

              <textarea value={mentorRemarks} onChange={(e) => setMentorRemarks(e.target.value)} maxLength={2000} rows={2} placeholder="Feedback for the team (optional)..." className="w-full rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading placeholder-hint outline-none focus:border-line-focus" />

              {action === 'complete' && (
                <>
                  <div><label className="mb-1 block text-xs text-muted">Completion Date</label><input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} className="rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading outline-none focus:border-line-focus" /></div>
                  <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                    <p className="mb-2 text-sm font-semibold text-yellow-300">🎓 Grade Assignment (Mentor Only)</p>
                    <p className="mb-3 text-xs text-muted">These grades will NOT be shown to the team leader</p>
                    <div className="space-y-2">
                      {grades.map((g, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                          <p className="text-xs text-body">{g.memberName} <span className="font-mono text-muted">({g.rollNo})</span></p>
                          <input value={g.grade} onChange={(e) => updateGrade(idx, 'grade', e.target.value)} placeholder="Grade" className="w-20 rounded-lg border border-line bg-input-bg px-2 py-1.5 text-xs text-heading outline-none focus:border-line-focus" />
                          <input value={g.remarks} onChange={(e) => updateGrade(idx, 'remarks', e.target.value)} placeholder="Remarks" className="w-32 rounded-lg border border-line bg-input-bg px-2 py-1.5 text-xs text-heading outline-none focus:border-line-focus" />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {action === 'reassign' && (
                <div>
                  <label className="mb-1 block text-xs text-secondary">Reason for Reassignment</label>
                  <textarea value={reassignNote} onChange={(e) => setReassignNote(e.target.value)} rows={3} placeholder="Explain why (min 10 chars)..." className="w-full rounded-lg border border-red-500/20 bg-input-bg px-3 py-2 text-sm text-heading placeholder-hint outline-none focus:border-red-500/40" />
                </div>
              )}

              <button type="button" disabled={submitting} onClick={handleSubmitReview} className="w-full rounded-lg bg-btn py-2.5 text-sm font-semibold text-ink hover:bg-btn-hover disabled:opacity-60 transition">{submitting ? 'Submitting...' : 'Submit Review'}</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskReviewCard
