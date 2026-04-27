import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Plus, Trash2 } from 'lucide-react'
import axiosInstance from '../../axiosInstance'

function ScheduleUploadForm({ teams, onSuccess }) {
  const [createdSchedule, setCreatedSchedule] = useState(null)
  const [attachmentUploading, setAttachmentUploading] = useState({})
  const [taskFiles, setTaskFiles] = useState({})

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      teamId: '', title: '', description: '',
      tasks: [{ title: '', description: '', fromDate: '', toDate: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'tasks' })

  const onSubmit = async (data) => {
    try {
      const res = await axiosInstance.post('/schedules', data)
      toast.success('Schedule uploaded!')
      setCreatedSchedule(res.data.data)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload schedule')
    }
  }

  const handleAttachmentUpload = async (taskId) => {
    const file = taskFiles[taskId]
    if (!file) return toast.error('Select a file first')
    setAttachmentUploading((p) => ({ ...p, [taskId]: true }))
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axiosInstance.post(`/schedules/${createdSchedule._id}/tasks/${taskId}/attachment`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setCreatedSchedule((p) => ({ ...p, tasks: p.tasks.map((t) => (t._id === taskId ? res.data.data : t)) }))
      setTaskFiles((p) => { const n = { ...p }; delete n[taskId]; return n })
      toast.success('File attached!')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Upload failed')
    } finally {
      setAttachmentUploading((p) => ({ ...p, [taskId]: false }))
    }
  }

  if (createdSchedule) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-sm font-semibold text-emerald-300">✓ Schedule Created — Attach Files (Optional)</p>
          <p className="mt-1 text-xs text-emerald-200/70">{createdSchedule.title}</p>
        </div>
        <div className="space-y-3">
          {(createdSchedule.tasks || []).map((task, idx) => (
            <div key={task._id} className="rounded-xl border border-line bg-surface p-4">
              <p className="mb-1 text-sm font-semibold text-heading">Step {idx + 1} — {task.title}</p>
              <p className="mb-2 text-xs text-muted">{new Date(task.fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – {new Date(task.toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              {task.attachments?.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {task.attachments.map((att, i) => (
                    <a key={i} href={att.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-line bg-surface px-2 py-1 text-xs text-blue-300 hover:bg-surface-alt transition">📄 {att.fileName}</a>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input type="file" onChange={(e) => setTaskFiles((p) => ({ ...p, [task._id]: e.target.files?.[0] }))} className="flex-1 text-xs text-secondary file:mr-2 file:rounded-lg file:border file:border-line file:bg-surface file:px-2 file:py-1 file:text-xs file:text-heading" />
                <button type="button" disabled={!taskFiles[task._id] || attachmentUploading[task._id]} onClick={() => handleAttachmentUpload(task._id)} className="rounded-lg bg-surface-alt px-3 py-1.5 text-xs font-medium text-heading hover:bg-btn-soft-hover disabled:opacity-60">{attachmentUploading[task._id] ? '...' : 'Upload'}</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={onSuccess} className="w-full rounded-lg bg-btn py-2.5 text-sm font-semibold text-ink hover:bg-btn-hover transition">Done</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-body">Select Team</label>
        <select {...register('teamId', { required: 'Team is required' })} className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-sm text-heading outline-none focus:border-line-focus">
          <option value="" className="bg-option">-- Select a team --</option>
          {(teams || []).map((t) => (<option key={t._id} value={t._id} className="bg-option">{t.teamId} — {t.branch} ({t.category})</option>))}
        </select>
        {errors.teamId && <p className="mt-1 text-xs text-red-400">{errors.teamId.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-body">Schedule Title</label>
        <input {...register('title', { required: 'Title is required', maxLength: 200 })} className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-sm text-heading placeholder-hint outline-none focus:border-line-focus" placeholder="e.g. SE Schedule Q1" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-body">Description (optional)</label>
        <textarea {...register('description', { maxLength: 2000 })} rows={2} className="w-full rounded-lg border border-line bg-input-bg px-3 py-2.5 text-sm text-heading placeholder-hint outline-none focus:border-line-focus" placeholder="Brief overview..." />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-body">Tasks</h4>
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <div key={field.id} className="rounded-xl border border-line bg-surface p-4 border-l-4 border-l-blue-500/50">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-secondary">Step {idx + 1}</p>
                {fields.length > 1 && (<button type="button" onClick={() => remove(idx)} className="rounded-md border border-red-500/40 p-1 text-red-300 hover:bg-red-500/10"><Trash2 size={14} /></button>)}
              </div>
              <div className="space-y-2">
                <input {...register(`tasks.${idx}.title`, { required: true })} placeholder="Task title" className="w-full rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading placeholder-hint outline-none focus:border-line-focus" />
                <textarea {...register(`tasks.${idx}.description`)} placeholder="Description (optional)" rows={2} className="w-full rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading placeholder-hint outline-none focus:border-line-focus" />
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="mb-1 block text-xs text-muted">From</label><input type="date" {...register(`tasks.${idx}.fromDate`, { required: true })} className="w-full rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading outline-none focus:border-line-focus" /></div>
                  <div><label className="mb-1 block text-xs text-muted">To</label><input type="date" {...register(`tasks.${idx}.toDate`, { required: true })} className="w-full rounded-lg border border-line bg-input-bg px-3 py-2 text-sm text-heading outline-none focus:border-line-focus" /></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => append({ title: '', description: '', fromDate: '', toDate: '' })} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-heading hover:bg-surface-alt"><Plus size={16} /> Add Task</button>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-btn py-2.5 text-sm font-semibold text-ink hover:bg-btn-hover disabled:opacity-60 transition">{isSubmitting ? 'Uploading...' : 'Upload Schedule'}</button>
    </form>
  )
}

export default ScheduleUploadForm
