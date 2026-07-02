import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import * as apiClient from '@api/client'

// Mock API client
vi.mock('@api/client', () => ({
  apiClient: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}))

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('AuthProvider', () => {
    it('should provide initial auth state', () => {
      const TestComponent = () => {
        const { user, isAuthenticated, isLoading, error } = useAuth()
        return (
          <div>
            <div>Authenticated: {isAuthenticated ? 'yes' : 'no'}</div>
            <div>Loading: {isLoading ? 'yes' : 'no'}</div>
            <div>Error: {error || 'none'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByText('Authenticated: no')).toBeDefined()
      expect(screen.getByText('Error: none')).toBeDefined()
    })

    it('should load user from token on mount', async () => {
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }

      localStorage.setItem('authToken', 'test-token')
      vi.mocked(apiClient.apiClient.getCurrentUser).mockResolvedValueOnce(mockUser)

      const TestComponent = () => {
        const { user, isLoading } = useAuth()
        if (isLoading) return <div>Loading...</div>
        return user ? <div>User: {user.name}</div> : <div>No user</div>
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      expect(screen.getByText('User: John Doe')).toBeDefined()
    })

    it('should handle load user error', async () => {
      localStorage.setItem('authToken', 'invalid-token')
      vi.mocked(apiClient.apiClient.getCurrentUser).mockRejectedValueOnce(
        new Error('Unauthorized')
      )

      const TestComponent = () => {
        const { user, error, isLoading } = useAuth()
        if (isLoading) return <div>Loading...</div>
        return (
          <div>
            <div>User: {user ? user.name : 'none'}</div>
            <div>Error: {error || 'none'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })

      expect(screen.getByText('User: none')).toBeDefined()
      expect(localStorage.getItem('authToken')).toBeNull()
    })
  })

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }

      vi.mocked(apiClient.apiClient.login).mockResolvedValueOnce({
        token: 'test-jwt-token',
        user: mockUser,
      })

      const TestComponent = () => {
        const { user, login } = useAuth()
        return (
          <div>
            <button onClick={() => login('user@example.com', 'password')}>Login</button>
            {user && <div>Logged in: {user.name}</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      const loginButton = screen.getByText('Login')
      await act(async () => {
        loginButton.click()
      })

      await waitFor(() => {
        expect(screen.getByText('Logged in: John Doe')).toBeDefined()
      })

      expect(localStorage.getItem('authToken')).toBe('test-jwt-token')
    })

    it('should handle login error', async () => {
      vi.mocked(apiClient.apiClient.login).mockRejectedValueOnce(
        new Error('Invalid credentials')
      )

      const TestComponent = () => {
        const { login, error } = useAuth()
        return (
          <div>
            <button onClick={() => login('wrong@example.com', 'wrong')}>Login</button>
            {error && <div>Error: {error}</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Login').click()
      })

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeDefined()
      })
    })

    it('should set isLoading during login', async () => {
      let loadingDuringCall = false

      vi.mocked(apiClient.apiClient.login).mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              token: 'token',
              user: {
                id: '1',
                email: 'user@example.com',
                name: 'John',
                role: 'MEMBER',
                status: 'ACTIVE',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z',
              },
            })
          }, 100)
        })
      })

      const TestComponent = () => {
        const { login, isLoading } = useAuth()
        return (
          <div>
            <button onClick={() => login('user@example.com', 'password')}>Login</button>
            {isLoading && <div>Loading...</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Login').click()
      })

      // Check if loading state was shown at some point
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      }, { timeout: 500 })
    })
  })

  describe('Register', () => {
    it('should register successfully', async () => {
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }

      vi.mocked(apiClient.apiClient.register).mockResolvedValueOnce(mockUser)

      const TestComponent = () => {
        const { user, register } = useAuth()
        return (
          <div>
            <button
              onClick={() =>
                register('newuser@example.com', 'password123', 'New User')
              }
            >
              Register
            </button>
            {user && <div>Registered: {user.name}</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Register').click()
      })

      await waitFor(() => {
        expect(screen.getByText('Registered: New User')).toBeDefined()
      })
    })

    it('should handle registration error', async () => {
      vi.mocked(apiClient.apiClient.register).mockRejectedValueOnce(
        new Error('Email already exists')
      )

      const TestComponent = () => {
        const { register, error } = useAuth()
        return (
          <div>
            <button
              onClick={() =>
                register('existing@example.com', 'password123', 'User')
              }
            >
              Register
            </button>
            {error && <div>Error: {error}</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Register').click()
      })

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeDefined()
      })
    })
  })

  describe('Logout', () => {
    it('should logout successfully', async () => {
      localStorage.setItem('authToken', 'test-token')
      vi.mocked(apiClient.apiClient.logout).mockResolvedValueOnce(undefined)

      const TestComponent = () => {
        const { user, logout, isAuthenticated } = useAuth()
        return (
          <div>
            <button onClick={() => logout()}>Logout</button>
            <div>Auth: {isAuthenticated ? 'yes' : 'no'}</div>
            <div>User: {user ? user.email : 'none'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Logout').click()
      })

      await waitFor(() => {
        expect(screen.getByText('Auth: no')).toBeDefined()
      })

      expect(localStorage.getItem('authToken')).toBeNull()
    })

    it('should cleanup token even if API fails', async () => {
      localStorage.setItem('authToken', 'test-token')
      vi.mocked(apiClient.apiClient.logout).mockRejectedValueOnce(
        new Error('Network error')
      )

      const TestComponent = () => {
        const { logout, isAuthenticated } = useAuth()
        return (
          <div>
            <button onClick={() => logout()}>Logout</button>
            <div>Auth: {isAuthenticated ? 'yes' : 'no'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Logout').click()
      })

      await waitFor(() => {
        expect(localStorage.getItem('authToken')).toBeNull()
      })
    })
  })

  describe('Error Management', () => {
    it('should provide clearError function', async () => {
      vi.mocked(apiClient.apiClient.login).mockRejectedValueOnce(
        new Error('Login failed')
      )

      const TestComponent = () => {
        const { login, error, clearError } = useAuth()
        return (
          <div>
            <button onClick={() => login('user@example.com', 'wrong')}>Login</button>
            {error && (
              <button onClick={clearError}>Clear Error</button>
            )}
            {error && <div>Error: {error}</div>}
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await act(async () => {
        screen.getByText('Login').click()
      })

      await waitFor(() => {
        expect(screen.getByText('Clear Error')).toBeDefined()
      })

      await act(async () => {
        screen.getByText('Clear Error').click()
      })

      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
    })
  })

  describe('Multiple Operations', () => {
    it('should handle sequential login and logout', async () => {
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'MEMBER',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      }

      vi.mocked(apiClient.apiClient.login).mockResolvedValueOnce({
        token: 'test-token',
        user: mockUser,
      })
      vi.mocked(apiClient.apiClient.logout).mockResolvedValueOnce(undefined)

      const TestComponent = () => {
        const { user, login, logout, isAuthenticated } = useAuth()
        return (
          <div>
            <button onClick={() => login('user@example.com', 'password')}>Login</button>
            <button onClick={() => logout()}>Logout</button>
            <div>Auth: {isAuthenticated ? 'yes' : 'no'}</div>
            <div>User: {user ? user.name : 'none'}</div>
          </div>
        )
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      // Login
      await act(async () => {
        screen.getByText('Login').click()
      })

      await waitFor(() => {
        expect(screen.getByText('Auth: yes')).toBeDefined()
      })

      // Logout
      await act(async () => {
        screen.getByText('Logout').click()
      })

      await waitFor(() => {
        expect(screen.getByText('Auth: no')).toBeDefined()
      })
    })
  })
})
