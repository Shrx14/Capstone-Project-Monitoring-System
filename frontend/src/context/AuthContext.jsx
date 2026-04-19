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

const normalizeUser = (userData) => {
  if (!userData || typeof userData !== 'object') {
    return null
  }

  return {
    _id: userData._id ?? '',
    name: userData.name ?? '',
    email: userData.email ?? '',
    role: userData.role ?? '',
  }
}

const getInitialUser = () => {
  const storedUser = localStorage.getItem(STORAGE_USER_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return normalizeUser(JSON.parse(storedUser))
  } catch {
    localStorage.removeItem(STORAGE_USER_KEY)
    return null
  }
}

const getInitialToken = () => localStorage.getItem(STORAGE_TOKEN_KEY)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(getInitialUser)
  const [token, setToken] = useState(getInitialToken)

  const login = useCallback((userData, authToken) => {
    const normalizedUser = normalizeUser(userData)

    setUser(normalizedUser)
    setToken(authToken)

    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(normalizedUser))
    localStorage.setItem(STORAGE_TOKEN_KEY, authToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_USER_KEY)
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    navigate('/login')
  }, [navigate])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [user, token, login, logout],
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