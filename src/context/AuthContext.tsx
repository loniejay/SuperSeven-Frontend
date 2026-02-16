'use client'
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { paths } from '@/paths'
import { User, AuthResponse, UserRole } from '@/types/user'
import { fetchCurrentUser } from '@/lib/api/fetchUser'

const isUserRole = (role: string | undefined): role is UserRole => {
  return role ? ['Owner', 'Secretary', 'Editor', 'Photographer', 'Client', 'Coordinator'].includes(role) : false
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (response: AuthResponse) => Promise<User | null>
  logout: () => Promise<void>
  loading: boolean
  updateUser: (userData: User) => void
  canAccess: (path: string) => boolean
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const setAuthCookies = useCallback((token: string, role: UserRole, remember: boolean = false) => {
    const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24; // 7 days or 1 day
    document.cookie = `authToken=${token}; path=/; max-age=${maxAge}; samesite=lax`;
    document.cookie = `user_role=${role}; path=/; max-age=${maxAge}; samesite=lax`;
  }, [])

  const clearAuthCookies = useCallback(() => {
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }, [])

  const updateUser = useCallback((userData: User) => {
    if (!isUserRole(userData.user_role)) {
      console.error('Invalid user role:', userData.user_role);
      return;
    }
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // setAuthCookies('', userData.user_role);
  }, [setAuthCookies])

  // Simplified cookie handling - backend should manage sessions
  const logout = useCallback(async () => {
    try {
      // Clear frontend state immediately
      setIsLoggingOut(true);
      clearAuthCookies();
      setIsAuthenticated(false);
      setUser(null);
      sessionStorage.removeItem('access_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');

      // Call backend logout
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Force full page reload to clear any residual state

      window.location.href = paths.login;
      setLoading(true);
    } catch (error) {
      console.error('Logout failed:', error);
      // Ensure state is cleared even if backend fails
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = paths.login;
    } finally {
      setIsLoggingOut(false);
      setLoading(false);
    }
  }, [clearAuthCookies]);

  const login = useCallback(async (response: AuthResponse & { remember?: boolean }): Promise<User | null> => {
    try {
      if (!response.access_token || !response.data) {
        throw new Error('Invalid authentication response');
      }

      // Clear existing tokens
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');

      // Store token based on remember me choice
      if (response.remember) {
        localStorage.setItem('access_token', response.access_token);
        sessionStorage.setItem('access_token', response.access_token);
      }

      localStorage.setItem('access_token', response.access_token);
      sessionStorage.setItem('access_token', response.access_token);
      document.cookie = `authToken=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      const userData = await fetchCurrentUser();
      if (!userData) throw new Error('Failed to fetch user data');

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      document.cookie = `user_role=${userData.user_role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;

      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      // Clear state on failure
      setIsAuthenticated(false);
      setUser(null);
      sessionStorage.removeItem('access_token');
      localStorage.removeItem('user');
      throw error;
    }
  }, [setAuthCookies]);

  const initializeAuth = useCallback(async () => {
    setLoading(true);
    try {
      // Check localStorage for persisted user
      const rememberMeToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const sessionToken = sessionStorage.getItem('access_token');
      const token = sessionToken || rememberMeToken;

      if (token) {
        // Check localStorage for persisted user
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?.id) {
              // Verify with backend if needed
              const currentUser = await fetchCurrentUser();

              if (currentUser?.id === parsedUser.id) {
                setUser(currentUser);
                setIsAuthenticated(true);

                // Optionally update localStorage with corrected user data
                localStorage.setItem('user', JSON.stringify(currentUser));

                // Set cookie based on where token came from
                if (currentUser && currentUser.user_role && isUserRole(currentUser.user_role)) {
                  if (rememberMeToken) {
                    setAuthCookies(token, currentUser.user_role, true);
                  } else {
                    setAuthCookies(token, currentUser.user_role, false);
                  }
                } else {
                  console.error('Invalid user role:', currentUser?.user_role);
                  throw new Error('Invalid user role');
                }

                return;
              }
            }
          } catch (e) {
            console.error('Failed to parse stored user', e);
          }
        }
      }

      // No valid session found
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Auth initialization failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setAuthCookies]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const canAccess = useCallback((path: string): boolean => {
    if (!user || !isAuthenticated || !isUserRole(user.user_role)) return false;
    
    switch (user.user_role) {
      case 'Owner': return true;
      case 'Secretary': return !path.startsWith('/billing');
      case 'Editor':
      case 'Photographer':
        return ['/', '/workload', '/settings'].some(
          allowed => path === allowed || path.startsWith(`${allowed}/`)
        );
      case 'Client':
        return ['/', '/booking', '/package', '/billing', '/settings'].some(
          allowed => path === allowed || path.startsWith(`${allowed}/`)
        );
      case 'Coordinator':
        return ['/', '/booking', '/package', '/billing', '/settings'].some(
          allowed => path === allowed || path.startsWith(`${allowed}/`)
        );
      default: return false;
    }
  }, [user, isAuthenticated])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      login,
      logout,
      updateUser,
      loading,
      canAccess,
      isLoggingOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}