import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axiosInstance from '../../axiosInstance'

function GradesOverview({ scheduleId, schedule, teamMembers }) {
  const [completedSubmissions, setCompletedSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!scheduleId) return
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await axiosInstance.get(`/task-submissions/grades/${scheduleId}`)
        setCompletedSubmissions(res.data.data || [])
      } catch (error) {
        if (error?.response?.status !== 403) {
          toast.error('Failed to load grades')
        }
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [scheduleId])

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-heading border-t-transparent" />
      </div>
    )
  }

  if (completedSubmissions.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-center backdrop-blur-sm">
        <p className="text-sm text-muted">No tasks have been completed and graded yet.</p>
      </div>
    )
  }

  // Build grade matrix: matrix[rollNo][taskId] = { grade, remarks }
  const tasks = schedule?.tasks || []
  const matrix = {}
  for (const m of teamMembers) {
    matrix[m.rollNo] = {}
  }
  for (const sub of completedSubmissions) {
    if (!sub.grades) continue
    for (const g of sub.grades) {
      if (!matrix[g.rollNo]) matrix[g.rollNo] = {}
      matrix[g.rollNo][sub.taskId] = { grade: g.grade, remarks: g.remarks }
    }
  }

  const exportCSV = () => {
    const header = ['Member Name', 'Roll No', ...tasks.map((t) => t.title)].join(',')
    const rows = teamMembers.map((m) => {
      const cols = [m.name, m.rollNo, ...tasks.map((t) => matrix[m.rollNo]?.[t._id]?.grade || '')]
      return cols.join(',')
    })
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grades-${scheduleId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
        <p className="text-xs font-medium text-yellow-300">⚠️ Grades are confidential — only visible to mentors</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-surface backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-surface-alt">
            <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
              <th className="px-3 py-2 whitespace-nowrap">Member Name</th>
              <th className="px-3 py-2 whitespace-nowrap">Roll No</th>
              {tasks.map((t) => (
                <th key={t._id} className="px-3 py-2 whitespace-nowrap">{t.title}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {teamMembers.map((m) => (
              <tr key={m.rollNo} className="text-body">
                <td className="px-3 py-2">{m.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{m.rollNo}</td>
                {tasks.map((t) => (
                  <td key={t._id} className="px-3 py-2 text-center font-bold">
                    {matrix[m.rollNo]?.[t._id]?.grade || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={exportCSV}
        className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-medium text-heading transition hover:bg-surface-alt"
      >
        📥 Export CSV
      </button>
    </div>
  )
}

export default GradesOverview
