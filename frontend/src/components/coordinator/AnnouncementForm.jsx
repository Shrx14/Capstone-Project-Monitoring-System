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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <h3 className="mb-3 text-base font-semibold text-white">Post Announcement</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <textarea
          {...register('message', {
            required: 'Message is required',
            maxLength: { value: 2000, message: 'Max 2000 characters' },
          })}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/20"
          placeholder="Type your announcement..."
        />
        {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 disabled:opacity-60 transition"
        >
          {isSubmitting ? 'Posting...' : 'Post Announcement'}
        </button>
      </form>

      {announcements.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-neutral-500 tracking-wide">Recent</h4>
          {announcements.slice(0, 10).map((a) => (
            <div key={a._id} className="border-b border-white/5 pb-2 last:border-0">
              <p className="text-sm text-neutral-300">{a.message}</p>
              <p className="mt-0.5 text-xs text-neutral-500">
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
