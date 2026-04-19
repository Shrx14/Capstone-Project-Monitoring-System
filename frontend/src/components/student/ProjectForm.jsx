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
      const members = data.groupMembers
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)

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
      <h2 className="mb-4 text-xl font-bold text-blue-900">Create Project</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Project Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required', maxLength: { value: 120, message: 'Max 120 characters' } })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900"
            placeholder="My Capstone Project"
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            {...register('description', { required: 'Description is required', maxLength: { value: 2000, message: 'Max 2000 characters' } })}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900"
            placeholder="Describe your project..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Group Members <span className="text-slate-400">(comma-separated)</span>
          </label>
          <input
            type="text"
            {...register('groupMembers', { required: 'At least one member required' })}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900"
            placeholder="Alice, Bob, Charlie"
          />
          {errors.groupMembers && <p className="mt-1 text-xs text-red-600">{errors.groupMembers.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Select Mentor</label>
          <select
            {...register('mentorId', { required: 'Please select a mentor' })}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900"
          >
            <option value="">-- Select a mentor --</option>
            {mentors.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
          {errors.mentorId && <p className="mt-1 text-xs text-red-600">{errors.mentorId.message}</p>}
          {mentors.length === 0 && (
            <p className="mt-1 text-xs text-slate-500">No mentors registered yet. Ask your mentor to register first.</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
