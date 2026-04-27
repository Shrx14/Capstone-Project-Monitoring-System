import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { EtheralShadow } from '@/components/ui/EtheralShadow'
import { useTheme } from '../context/ThemeContext'
import collegeLogo from '../assets/college logo.png'

function HomePage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="relative min-h-screen bg-page">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color={isDark ? 'rgba(120, 120, 120, 1)' : 'rgba(100, 140, 200, 0.5)'}
          animation={{ scale: 80, speed: 80 }}
          noise={{ opacity: isDark ? 0.8 : 0.4, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: isDark ? '#0a0a0a' : '#eef0f5' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <img src={collegeLogo} alt="FCRIT Logo" className="h-20 w-20 object-contain" />
            <span className="text-x font-light tracking-wide text-secondary">
              Fr. Conceicao Rodrigues Institute Of Technology
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-line bg-surface p-2 text-secondary backdrop-blur-sm transition-all duration-300 hover:border-line-hover hover:bg-surface-alt hover:text-heading"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              to="/about"
              className="rounded-lg border border-line bg-surface px-5 py-2 text-sm font-medium text-label backdrop-blur-sm transition-all duration-300 hover:border-line-hover hover:bg-surface-alt hover:text-heading"
            >
              About Us
            </Link>
            <Link
              to="/register-team"
              className="rounded-lg border border-line bg-surface px-5 py-2 text-sm font-medium text-label backdrop-blur-sm transition-all duration-300 hover:border-line-hover hover:bg-surface-alt hover:text-heading"
            >
              Register Team
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-line bg-surface px-5 py-2 text-sm font-medium text-label backdrop-blur-sm transition-all duration-300 hover:border-line-hover hover:bg-surface-alt hover:text-heading"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-btn px-5 py-2 text-sm font-semibold text-ink transition-all duration-300 hover:bg-btn-hover hover:shadow-lg hover:shadow-glow"
            >
              Register
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {/* Badge */}
          <div className="mb-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-body backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Capstone Project Monitoring System
              (PawarAI)
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-heading sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up">
            Monitor Your
            <span className="block bg-gradient-to-r from-heading via-secondary to-th-muted bg-clip-text text-transparent">
              Capstone Projects
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-secondary sm:text-lg animate-slide-up-delay">
            A unified platform for students, mentors, and coordinators to
            collaborate, track progress, and manage capstone projects seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-slide-up-delay-2">
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-btn px-8 py-3.5 text-sm font-semibold text-ink transition-all duration-300 hover:shadow-xl hover:shadow-glow"
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-8 py-3.5 text-sm font-medium text-body backdrop-blur-sm transition-all duration-300 hover:border-line-hover hover:bg-surface-alt hover:text-heading"
            >
              Sign In →
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3 animate-slide-up-delay-3">
            <div className="group relative flex flex-col rounded-2xl border border-line bg-surface p-7 text-left backdrop-blur-sm transition-all duration-500 hover:border-line-hover hover:bg-surface-hover hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(var(--c-glow))]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-surface-alt to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-1 flex-col">
                <h3 className="mb-4 text-base font-semibold text-heading">For Team Leaders</h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-secondary">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Register your team with auto-generated Team ID
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Await coordinator approval and mentor assignment
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    View project schedule with tasks and deadlines
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Submit task progress and member contributions
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative flex flex-col rounded-2xl border border-line bg-surface p-7 text-left backdrop-blur-sm transition-all duration-500 hover:border-line-hover hover:bg-surface-hover hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(var(--c-glow))]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-surface-alt to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-1 flex-col">
                <h3 className="mb-4 text-base font-semibold text-heading">For Mentors</h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-secondary">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Review assigned student projects
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Provide feedback & evaluations
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Track progress across all mentees
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Download submitted documents
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative flex flex-col rounded-2xl border border-line bg-surface p-7 text-left backdrop-blur-sm transition-all duration-500 hover:border-line-hover hover:bg-surface-hover hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(var(--c-glow))]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-surface-alt to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-1 flex-col">
                <h3 className="mb-4 text-base font-semibold text-heading">For Coordinators</h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-secondary">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Oversee all capstone projects
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Assign mentors to student groups
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Monitor overall progress & status
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-th-muted" />
                    Manage the full capstone workflow
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-faint">
          © 2026 Capstone Project Monitoring System. All rights reserved.
        </footer>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out both;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out both;
          animation-delay: 0.15s;
        }
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out both;
          animation-delay: 0.3s;
        }
        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out both;
          animation-delay: 0.45s;
        }
        .animate-slide-up-delay-3 {
          animation: slide-up 0.8s ease-out both;
          animation-delay: 0.6s;
        }
      `}</style>
    </div>
  )
}

export default HomePage
