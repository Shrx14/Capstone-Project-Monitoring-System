import { Link } from 'react-router-dom'
import { EtheralShadow } from '@/components/ui/EtheralShadow'
import collegeLogo from '../assets/college logo.png'

function HomePage() {
  return (
    <div className="relative min-h-screen bg-neutral-950">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <EtheralShadow
          color="rgba(120, 120, 120, 1)"
          animation={{ scale: 80, speed: 80 }}
          noise={{ opacity: 0.8, scale: 1.2 }}
          sizing="fill"
          style={{ backgroundColor: '#0a0a0a' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <img src={collegeLogo} alt="FCRIT Logo" className="h-20 w-20 object-contain" />
            <span className="text-x font-light tracking-wide text-neutral-400">
              Fr. Conceicao Rodrigues Institute Of Technology
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              About Us
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-white px-5 py-2 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:bg-neutral-200 hover:shadow-lg hover:shadow-white/10"
            >
              Register
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          {/* Badge */}
          <div className="mb-8 animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Capstone Project Monitoring System
              (PawarAI)
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl animate-slide-up">
            Monitor Your
            <span className="block bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">
              Capstone Projects
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg animate-slide-up-delay">
            A unified platform for students, mentors, and coordinators to
            collaborate, track progress, and manage capstone projects seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row animate-slide-up-delay-2">
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:shadow-xl hover:shadow-white/15"
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-medium text-neutral-300 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              Sign In →
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3 animate-slide-up-delay-3">
            <div className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 text-left backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07] hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-1 flex-col">
                <h3 className="mb-4 text-base font-semibold text-white">For Students</h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-neutral-400">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Submit & manage project proposals
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Track milestones & deadlines
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Upload project files & documents
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    View mentor feedback in real-time
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 text-left backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07] hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-1 flex-col">
                <h3 className="mb-4 text-base font-semibold text-white">For Mentors</h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-neutral-400">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Review assigned student projects
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Provide feedback & evaluations
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Track progress across all mentees
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Download submitted documents
                  </li>
                </ul>
              </div>
            </div>

            <div className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7 text-left backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.07] hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-1 flex-col">
                <h3 className="mb-4 text-base font-semibold text-white">For Coordinators</h3>
                <ul className="space-y-2.5 text-sm leading-relaxed text-neutral-400">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Oversee all capstone projects
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Assign mentors to student groups
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Monitor overall progress & status
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-500" />
                    Manage the full capstone workflow
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-neutral-600">
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
