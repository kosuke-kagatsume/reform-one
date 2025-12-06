import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserWithOrg, PlanType, PLAN_FEATURES } from '@/types/premier'

interface AuthContextType {
  user: UserWithOrg | null
  isLoading: boolean
  isAuthenticated: boolean
  planType: PlanType | null
  isAdmin: boolean
  isReformCompany: boolean
  hasFeature: (feature: string) => boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserWithOrg | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('premier_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
      } catch {
        localStorage.removeItem('premier_user')
      }
    }
    setIsLoading(false)
  }, [])

  const planType = user?.subscription?.planType || null
  const isAdmin = user?.role === 'ADMIN'
  const isReformCompany = user?.organization?.type === 'REFORM_COMPANY'
  const isAuthenticated = !!user

  const hasFeature = (feature: string): boolean => {
    if (isReformCompany) return true
    if (!planType) return false
    return PLAN_FEATURES[planType].includes(feature)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      setUser(data.user)
      localStorage.setItem('premier_user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('premier_user')
  }

  const refreshUser = async () => {
    if (!user) return
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('premier_user', JSON.stringify(data.user))
      }
    } catch {
      // Silently fail
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        planType,
        isAdmin,
        isReformCompany,
        hasFeature,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
