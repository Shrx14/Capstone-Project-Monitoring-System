import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const TeamLeaderRoute = () => {
  const { user, team } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'teamleader') {
    return <Navigate to="/unauthorized" replace />
  }

  if (!team || team.status === 'pending' || team.status === 'rejected') {
    return <Navigate to="/pending-approval" replace />
  }

  return <Outlet />
}

export default TeamLeaderRoute
