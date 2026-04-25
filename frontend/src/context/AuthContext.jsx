import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(undefined)

const STORAGE_USER_KEY = 'authUser'
const STORAGE_TOKEN_KEY = 'authToken'
const STORAGE_TEAM_KEY = 'authTeam'

const normalizeUser = (userData) => {
  if (!userData || typeof userData !== 'object') {
    return null
  }

  if (userData.role === 'student') {
    return null
  }

  return {
    _id: userData._id ?? '',
    name: userData.name ?? '',
    email: userData.email ?? '',
    role: userData.role ?? '',
  }
}

const normalizeTeam = (teamData) => {
  if (!teamData || typeof teamData !== 'object') {
    return null
  }

  return {
    _id: teamData._id ?? '',
    teamId: teamData.teamId ?? '',
    status: teamData.status ?? 'pending',
    category: teamData.category ?? '',
    branch: teamData.branch ?? '',
    academicYear: teamData.academicYear ?? '',
    members: teamData.members ?? [],
    mentorId: teamData.mentorId ?? null,
    rejectionReason: teamData.rejectionReason ?? '',
  }
}

const getInitialUser = () => {
  const storedUser = localStorage.getItem(STORAGE_USER_KEY)

  if (!storedUser) {
    return null
  }

  try {
    const normalized = normalizeUser(JSON.parse(storedUser))
    if (!normalized) {
      localStorage.removeItem(STORAGE_USER_KEY)
      localStorage.removeItem(STORAGE_TOKEN_KEY)
      return null
    }
    return normalized
  } catch {
    localStorage.removeItem(STORAGE_USER_KEY)
    return null
  }
}

const getInitialTeam = () => {
  const storedTeam = localStorage.getItem(STORAGE_TEAM_KEY)

  if (!storedTeam) {
    return null
  }

  try {
    return normalizeTeam(JSON.parse(storedTeam))
  } catch {
    localStorage.removeItem(STORAGE_TEAM_KEY)
    return null
  }
}

const getInitialToken = () => localStorage.getItem(STORAGE_TOKEN_KEY)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(getInitialUser)
  const [token, setToken] = useState(getInitialToken)
  const [team, setTeam] = useState(getInitialTeam)

  const login = useCallback((userData, authToken, teamData = null) => {
    const normalizedUser = normalizeUser(userData)
    const normalizedTeam = teamData ? normalizeTeam(teamData) : null

    setUser(normalizedUser)
    setToken(authToken)
    setTeam(normalizedTeam)

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser))
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken)
    if (normalizedTeam) {
      localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(normalizedTeam))
    } else {
      localStorage.removeItem(STORAGE_TEAM_KEY)
    }
  }, [])

  const updateTeam = useCallback((teamData) => {
    const normalized = normalizeTeam(teamData)
    setTeam(normalized)

    if (normalized) {
      localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(normalized))
    } else {
      localStorage.removeItem(STORAGE_TEAM_KEY)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    setTeam(null)
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_TEAM_KEY)
    navigate('/login')
  }, [navigate])

  const value = useMemo(
    () => ({
      user,
      token,
      team,
      isAuthenticated: !!token,
      login,
      updateTeam,
      logout,
    }),
    [user, token, team, login, updateTeam, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}