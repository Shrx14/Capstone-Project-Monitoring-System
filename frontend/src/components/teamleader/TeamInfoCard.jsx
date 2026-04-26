function TeamInfoCard({ team }) {
  if (!team) return null

  const statusColors = {
    approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
  }

  const categoryColors = {
    internal: 'bg-blue-500/20 text-blue-300',
    external: 'bg-purple-500/20 text-purple-300',
    interdisciplinary: 'bg-orange-500/20 text-orange-300',
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-2xl font-bold text-white">{team.teamId}</h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusColors[team.status] || statusColors.pending}`}>
          {team.status}
        </span>
      </div>

      {/* Info badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${categoryColors[team.category] || 'bg-white/10 text-neutral-300'}`}>
          {team.category}
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-neutral-300">
          {team.branch}
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-neutral-300">
          {team.academicYear}
        </span>
      </div>

      {/* Mentor */}
      {team.mentorId && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-medium text-neutral-500">Assigned Mentor</p>
          <p className="text-sm font-semibold text-neutral-200">
            {typeof team.mentorId === 'object' ? team.mentorId.name : 'Assigned'}
          </p>
          {typeof team.mentorId === 'object' && team.mentorId.email && (
            <p className="text-xs text-neutral-400">{team.mentorId.email}</p>
          )}
        </div>
      )}

      {/* Members Table */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-neutral-300">Team Members</h4>
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5">
              <tr className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Roll No</th>
                <th className="px-3 py-2">Branch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {(team.members || []).map((m, i) => (
                <tr key={m.rollNo || i} className="text-neutral-300">
                  <td className="px-3 py-2 text-neutral-500">{i + 1}</td>
                  <td className="px-3 py-2">{m.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{m.rollNo}</td>
                  <td className="px-3 py-2 text-xs">{m.branch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default TeamInfoCard
