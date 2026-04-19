import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold tracking-wide">Capstone Monitor</h1>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm font-medium">{user.name}</span>
              <span className="rounded-full bg-blue-700 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide">
                {user.role}
              </span>
            </>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-blue-700 px-3 py-1.5 text-sm font-medium transition hover:bg-blue-600"
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