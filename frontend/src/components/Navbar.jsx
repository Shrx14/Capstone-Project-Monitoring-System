import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="border-b border-white/10 bg-black/40 text-white backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold tracking-wide">Capstone Monitor</h1>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm font-medium text-neutral-300">{user.name}</span>
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                {user.role}
              </span>
            </>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-white/15 px-3 py-1.5 text-sm font-medium transition hover:bg-white/25"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar