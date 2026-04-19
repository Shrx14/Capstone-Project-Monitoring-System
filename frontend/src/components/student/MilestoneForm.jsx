import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function MilestoneForm({ projectId, onClose, onSuccess }) {
  const [milestones, setMilestones] = useState([])
  const [loadingMilestones, setLoadingMilestones] = useState(true)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  const fetchMilestones = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/milestones/project/${projectId}`)
      setMilestones(res.data.data || [])
    } catch {
      toast.error('Failed to load milestones')
    } finally {
      setLoadingMilestones(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMilestones()
  }, [fetchMilestones])

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post('/milestones', { ...data, projectId })
      toast.success('Milestone added!')
      reset()
      fetchMilestones()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add milestone')
    }
  }

  const toggleStatus = async (milestone) => {
    try {
      const newStatus = milestone.status === 'pending' ? 'completed' : 'pending'
      await axiosInstance.patch(`/milestones/${milestone._id}`, { status: newStatus })
      fetchMilestones()
    } catch {
      toast.error('Failed to update milestone status')
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-white">Milestones</h2>

      {loadingMilestones ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      ) : milestones.length === 0 ? (
        <p className="mb-4 text-sm text-neutral-500">No milestones yet. Add one below.</p>
      ) : (
        <div className="mb-4 space-y-2">
          {milestones.map((m) => (
            <div key={m._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3">
              <div>
                <p className="text-sm font-medium text-neutral-200">{m.title}</p>
                <p className="text-xs text-neutral-500">
                  Due: {new Date(m.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleStatus(m)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  m.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30'
                }`}
              >
                {m.status === 'completed' ? '✓ Done' : 'Mark Done'}
              </button>
            </div>
          ))}
        </div>
      )}

      <hr className="my-4 border-white/10" />
      <h3 className="mb-3 text-sm font-semibold text-neutral-300">Add New Milestone</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <input
            type="text"
            {...register('title', { required: 'Title is required', maxLength: { value: 120, message: 'Max 120 characters' } })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            placeholder="Milestone title"
          />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
        </div>
        <div>
          <textarea
            {...register('description')}
            rows={2}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            placeholder="Description (optional)"
          />
        </div>
        <div>
          <input
            type="date"
            {...register('dueDate', { required: 'Due date is required' })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
          />
          {errors.dueDate && <p className="mt-1 text-xs text-red-400">{errors.dueDate.message}</p>}
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 disabled:opacity-60 transition">
            {isSubmitting ? 'Adding...' : 'Add Milestone'}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-white/10 transition">
            Close
          </button>
        </div>
      </form>
    </div>
  )
}

export default MilestoneForm
