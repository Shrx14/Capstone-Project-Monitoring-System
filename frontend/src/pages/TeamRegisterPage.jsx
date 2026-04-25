import { Link, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import axiosInstance from '../axiosInstance'
import { useAuth } from '../context/AuthContext'
import { EtheralShadow } from '@/components/ui/EtheralShadow'

function TeamRegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rollNo: '',
      leaderBranch: '',
      academicYear: '2025-26',
      teamBranch: '',
      category: 'internal',
      members: [{ name: '', rollNo: '', branch: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
    rules: { required: true },
  })

  const onSubmit = async (data) => {
    const payload = {
      teamLeader: {
        name: data.name,
        email: data.email,
        password: data.password,
        rollNo: data.rollNo,
        branch: data.leaderBranch,
      },
      team: {
        members: data.members,
        branch: data.teamBranch,
        category: data.category,
        academicYear: data.academicYear,
      },
    }

    try {
      const response = await axiosInstance.post('/auth/register-team', payload)
      login(response.data.user, response.data.token, response.data.team)
      toast.success('Team registered successfully!')
      navigate('/pending-approval')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="relative min-h-screen bg-neutral-950">
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color="rgba(120, 120, 120, 1)"
          animation={{ scale: 80, speed: 80 }}
          noise={{ opacity: 0.8, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: '#0a0a0a' }}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        <div className="mb-6 rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-4 text-sm text-indigo-100">
          After registration, your application will be reviewed by a coordinator who will approve your team and assign a mentor.
          You can log in and check your status anytime.
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Team Leader Information</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Full Name" {...register('name', { required: true })} />
              <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Email" type="email" {...register('email', { required: true })} />
              <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Password" type="password" {...register('password', { required: true, minLength: 6 })} />
              <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Roll Number (e.g. SE2301)" {...register('rollNo', { required: true })} />
              <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white md:col-span-2" placeholder="Branch / Department" {...register('leaderBranch', { required: true })} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Team Information</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Academic Year" {...register('academicYear', { required: true })} />
              <input className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Team Department / Branch" {...register('teamBranch', { required: true })} />
              <select className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white" {...register('category', { required: true })}>
                <option value="internal" className="bg-neutral-900">internal</option>
                <option value="external" className="bg-neutral-900">external</option>
                <option value="interdisciplinary" className="bg-neutral-900">interdisciplinary</option>
              </select>
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">Team Members</h2>
            <p className="mb-3 text-sm text-neutral-400">Add all team members (excluding yourself as leader).</p>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-2 rounded-lg border border-white/10 bg-white/5 p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                  <input className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Member Name" {...register(`members.${index}.name`, { required: true })} />
                  <input className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Roll Number" {...register(`members.${index}.rollNo`, { required: true })} />
                  <input className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white" placeholder="Branch" {...register(`members.${index}.branch`, { required: true })} />
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(index)} className="rounded-md border border-red-500/40 px-2 text-red-300 hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ name: '', rollNo: '', branch: '' })}
              disabled={fields.length >= 6}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
            >
              <Plus size={16} /> Add Member
            </button>
          </section>

          {(errors.name || errors.email || errors.password || errors.rollNo || errors.leaderBranch || errors.teamBranch || errors.academicYear) && (
            <p className="text-sm text-red-300">Please fill all required fields.</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Registering...' : 'Register Team'}
          </button>

          <p className="text-center text-sm text-neutral-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-white hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default TeamRegisterPage
