import { Link } from 'react-router-dom'
import { EtheralShadow } from '@/components/ui/EtheralShadow'
import KineticTeamHybrid from '@/components/ui/KineticTeamHybrid'
import collegeLogo from '../assets/college logo.png'
import { ArrowLeft } from 'lucide-react'

/* ---------- Member Photos ---------- */
import sumitPhoto from '../assets/sumit pawar.jpeg'
import shreyasPhoto from '../assets/shreyas sawant.jpeg'
import kaustubhPhoto from '../assets/kaustubh waje.jpeg'
import anoojPhoto from '../assets/anooj shete.jpeg'
import raghavPhoto from '../assets/raghav sharma.jpeg'

/* ---------- Team Data ---------- */
const TEAM = [
  {
    id: '01',
    name: 'Sumit Pawar',
    rollNo: '1023227',
    role: 'Frontend (Components)',
    image: sumitPhoto,
    imagePosition: 'center 20%',
  },
  {
    id: '02',
    name: 'Shreyas Sawant',
    rollNo: '1023242',
    role: 'Backend (Authentication & API)',
    image: shreyasPhoto,
    imagePosition: 'center 20%',
  },
  {
    id: '03',
    name: 'Kaustubh Waje',
    rollNo: '1023262',
    role: 'Frontend (UI/UX & Dashboard Animations)',
    image: kaustubhPhoto,
    imagePosition: 'center 20%',
  },
  {
    id: '04',
    name: 'Anooj Shete',
    rollNo: '1023250',
    role: 'Backend (File Handling & Core Logic)',
    image: anoojPhoto,
    imagePosition: 'center 20%',
  },
  {
    id: '05',
    name: 'Bethuel Shilesh',
    rollNo: '1023251',
    role: 'DB Schema & Optimization',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
    imagePosition: 'center center',
  },
  {
    id: '06',
    name: 'Raghav Sharma',
    rollNo: '1023248',
    role: 'Integration & Deployment',
    image: raghavPhoto,
    imagePosition: 'center center',
  },
]

function AboutPage() {
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
            <img src={collegeLogo} alt="FCRIT Logo" className="h-14 w-14 object-contain" />
            <span className="text-xs font-light tracking-wide text-neutral-400">
              Fr. Conceicao Rodrigues Institute Of Technology
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-neutral-200 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={16} />
              Home
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

        {/* About Section */}
        <div className="mx-auto w-full max-w-6xl px-6 pt-12 md:px-12">
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
              About the Project
            </p>
            <h2 className="mb-6 text-3xl font-light tracking-tight text-white sm:text-4xl">
              Built by students, for students.
            </h2>
            <p className="text-sm leading-relaxed text-neutral-400">
              The Capstone Project Monitoring System is an intelligent web application designed to modernize the way academic projects are managed and tracked. It provides a structured ecosystem where students can submit milestones, mentors can review and guide progress, and coordinators can oversee all projects through a centralized dashboard. With features like role-based access control, secure authentication, real-time updates, and file management, the system eliminates inefficiencies of manual tracking and enhances transparency, accountability, and collaboration across all stakeholders.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <KineticTeamHybrid
          team={TEAM}
          title="Meet the Team"
          subtitle="FSDL Internal Hackathon"
        />

        {/* About Section */}
        <div className="mx-auto w-full max-w-6xl px-6 pt-12 md:px-12">
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
              Academic Attribution
            </p>
            <p className="text-sm leading-relaxed text-neutral-400">
              This project was developed as part of the Full Stack Development Laboratory course at Fr. C. Rodrigues Institute of Technology, Vashi, Navi Mumbai, Department of Computer Engineering.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-8 text-center text-xs text-neutral-600">
          © 2026 Capstone Project Monitoring System. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default AboutPage
