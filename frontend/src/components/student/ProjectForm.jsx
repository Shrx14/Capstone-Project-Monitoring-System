import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function ProjectForm({ onClose, onSuccess }) {
  const [mentors, setMentors] = useState([])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  useEffect(() => {
    axiosInstance
      .get('/users?role=mentor')
      .then((res) => setMentors(res.data.data || []))
      .catch(() => toast.error('Failed to load mentors'))
  }, [])

  const onSubmit = async (data) => {
    try {
      const members = data.groupMembers.split(',').map((m) => m.trim()).filter(Boolean)
      await axiosInstance.post('/projects', {
        title: data.title,
        description: data.description,
        groupMembers: members,
        mentorId: data.mentorId,
      })
      toast.success('Project created successfully!')
      onSuccess()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create project')
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-xl font-bold text-white">Create Project</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Project Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required', maxLength: { value: 120, message: 'Max 120 characters' } })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            placeholder="My Capstone Project"
          />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Description</label>
          <textarea
            {...register('description', { required: 'Description is required', maxLength: { value: 2000, message: 'Max 2000 characters' } })}
            rows={4}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            placeholder="Describe your project..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">
            Group Members <span className="text-neutral-500">(comma-separated)</span>
          </label>
          <input
            type="text"
            {...register('groupMembers', { required: 'At least one member required' })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
            placeholder="Alice, Bob, Charlie"
          />
          {errors.groupMembers && <p className="mt-1 text-xs text-red-400">{errors.groupMembers.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Select Mentor</label>
          <select
            {...register('mentorId', { required: 'Please select a mentor' })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
          >
            <option value="" className="bg-neutral-900">-- Select a mentor --</option>
            {mentors.map((m) => (
              <option key={m._id} value={m._id} className="bg-neutral-900">
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          {errors.mentorId && <p className="mt-1 text-xs text-red-400">{errors.mentorId.message}</p>}
          {mentors.length === 0 && (
            <p className="mt-1 text-xs text-neutral-500">No mentors registered yet.</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 disabled:opacity-60 transition">
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
          <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-white/10 transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
