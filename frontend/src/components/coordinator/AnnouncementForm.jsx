import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function AnnouncementForm({ announcements = [], onPosted }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post('/announcements', { message: data.message })
      toast.success('Announcement posted!')
      reset()
      onPosted()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post announcement')
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-base font-semibold text-blue-900">Post Announcement</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <textarea
          {...register('message', {
            required: 'Message is required',
            maxLength: { value: 2000, message: 'Max 2000 characters' },
          })}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900"
          placeholder="Type your announcement..."
        />
        {errors.message && <p className="text-xs text-red-600">{errors.message.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {isSubmitting ? 'Posting...' : 'Post Announcement'}
        </button>
      </form>

      {announcements.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wide">Recent</h4>
          {announcements.slice(0, 10).map((a) => (
            <div key={a._id} className="border-b border-slate-100 pb-2 last:border-0">
              <p className="text-sm text-slate-700">{a.message}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {a.createdBy?.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AnnouncementForm
