import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

function TaskSubmitModal({ task, submission, scheduleId, teamMembers, onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Read-only view for completed tasks
  if (submission?.status === 'completed') {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
          <p className="text-sm font-semibold text-emerald-300">
            ✓ Task completed on {submission.completedDate ? formatDate(submission.completedDate) : 'N/A'}
          </p>
        </div>

        {submission.memberContributions?.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-body">Member Contributions</h4>
            <div className="space-y-2">
              {submission.memberContributions.map((mc, idx) => (
                <div key={idx} className="rounded-lg border border-line bg-surface p-3">
                  <p className="text-sm font-medium text-label">
                    {mc.memberName} <span className="font-mono text-xs text-muted">({mc.rollNo})</span>
                  </p>
                  <p className="mt-1 text-sm text-secondary">{mc.workDone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg border border-line bg-surface py-2.5 text-sm font-semibold text-heading transition hover:bg-surface-alt"
        >
          Close
        </button>
      </div>
    )
  }

  // Build default contributions from team members, pre-filling from existing submission
  const defaultContributions = (teamMembers || []).map((m) => {
    const existing = submission?.memberContributions?.find((mc) => mc.rollNo === m.rollNo)
    return {
      memberName: m.name,
      rollNo: m.rollNo,
      workDone: existing?.workDone || '',
    }
  })

  const { register, handleSubmit, getValues, control } = useForm({
    defaultValues: {
      statusNote: submission?.statusNote || '',
      memberContributions: defaultContributions.length > 0
        ? defaultContributions
        : [{ memberName: '', rollNo: '', workDone: '' }],
    },
  })

  const { fields } = useFieldArray({ control, name: 'memberContributions' })

  const saveDraft = async () => {
    const contributions = getValues('memberContributions')
    const note = getValues('statusNote')

    try {
      await axiosInstance.put('/task-submissions', {
        scheduleId,
        taskId: task._id,
        statusNote: note,
        memberContributions: contributions,
      })
      toast.success('Draft saved!')
      onSuccess()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save draft')
    }
  }

  const submitToMentor = async () => {
    const contributions = getValues('memberContributions')
    const note = getValues('statusNote')

    setUploading(true)
    try {
      // Step 1: Save contributions
      const saveRes = await axiosInstance.put('/task-submissions', {
        scheduleId,
        taskId: task._id,
        statusNote: note,
        memberContributions: contributions,
      })

      const submissionId = saveRes.data.data._id

      // Step 2: Submit (with optional file)
      if (file) {
        const formData = new FormData()
        formData.append('file', file)

        await axiosInstance.post(`/task-submissions/${submissionId}/submit`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(pct)
          },
        })
      } else {
        await axiosInstance.post(`/task-submissions/${submissionId}/submit`)
      }

      toast.success('Submitted to mentor for review!')
      onSuccess()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-heading">
          Step {(task.order ?? 0) + 1} — {task.title}
        </h3>
        <p className="text-xs text-muted">
          {formatDate(task.fromDate)} → {formatDate(task.toDate)}
        </p>
      </div>

      {submission?.status === 'reassigned' && submission?.reassignNote && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <p className="mb-1 text-xs font-semibold text-red-300">⚠ Mentor's Reassignment Reason:</p>
          {submission.reassignNote}
        </div>
      )}

      {/* Section 1: Progress Summary */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-body">Progress Summary</h4>
        <textarea
          {...register('statusNote')}
          rows={3}
          maxLength={2000}
          placeholder="Describe overall progress..."
          className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-sm text-heading placeholder-hint outline-none transition focus:border-line-focus focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Section 2: Member Contributions */}
      <div>
        <h4 className="mb-1 text-sm font-semibold text-body">Member Contributions</h4>
        <p className="mb-3 text-xs text-muted">Enter what each member worked on for this task.</p>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-lg border border-line bg-surface p-3">
              <p className="mb-1 text-xs font-medium text-body">
                {field.memberName}{' '}
                <span className="font-mono text-muted">({field.rollNo})</span>
              </p>
              <input type="hidden" {...register(`memberContributions.${index}.memberName`)} />
              <input type="hidden" {...register(`memberContributions.${index}.rollNo`)} />
              <textarea
                {...register(`memberContributions.${index}.workDone`, { required: true })}
                rows={2}
                placeholder={`What ${field.memberName} worked on...`}
                className="w-full rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading placeholder-hint outline-none transition focus:border-line-focus focus:ring-1 focus:ring-accent"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: File */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-body">Attach a File (optional)</h4>
        <input
          type="file"
          accept=".pdf,.docx,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-secondary file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-heading hover:file:bg-surface-alt"
        />
        {file && <p className="mt-1 text-xs text-muted">Selected: {file.name}</p>}
      </div>

      {/* Upload progress */}
      {uploading && uploadProgress > 0 && (
        <div className="rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-1.5 rounded-full bg-heading transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={saveDraft}
          disabled={uploading}
          className="rounded-lg border border-line bg-surface py-2.5 text-sm font-semibold text-heading transition hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-60"
        >
          Save Draft
        </button>
        <button
          type="button"
          onClick={handleSubmit(submitToMentor)}
          disabled={uploading}
          className="rounded-lg bg-btn py-2.5 text-sm font-semibold text-ink transition hover:bg-btn-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? 'Submitting...' : 'Submit to Mentor'}
        </button>
      </div>
    </div>
  )
}

export default TaskSubmitModal
