import { Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav className="border-b border-line bg-nav text-heading backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold tracking-wide">Capstone Monitor</h1>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="text-sm font-medium text-body">{user.name}</span>
              <span className="rounded-full bg-badge px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-heading">
                {user.role}
              </span>
            </>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-line bg-surface p-2 text-secondary transition hover:bg-surface-alt hover:text-heading"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="rounded-md bg-badge px-3 py-1.5 text-sm font-medium transition hover:bg-surface-alt"
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