import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'shared-types';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  googleLogin: (email: string, name?: string, avatarUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('settl_access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize & load profile from stored token
  useEffect(() => {
    async function loadUser() {
      if (accessToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            // Token expired or invalid, attempt refresh
            await refreshTokens();
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logoutLocally();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const refreshTokens = async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        localStorage.setItem('settl_access_token', data.accessToken);

        // Fetch user profile with new token
        const meRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }
      } else {
        logoutLocally();
      }
    } catch (err) {
      logoutLocally();
    }
  };

  const logoutLocally = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('settl_access_token');
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Login failed');
    }

    setUser(data.user);
    setAccessToken(data.tokens.accessToken);
    localStorage.setItem('settl_access_token', data.tokens.accessToken);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Registration failed');
    }

    setUser(data.user);
    setAccessToken(data.tokens.accessToken);
    localStorage.setItem('settl_access_token', data.tokens.accessToken);
  };

  const googleLogin = async (email: string, name?: string, avatarUrl?: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, avatarUrl }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Google authentication failed');
    }

    setUser(data.user);
    setAccessToken(data.tokens.accessToken);
    localStorage.setItem('settl_access_token', data.tokens.accessToken);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      logoutLocally();
    }
  };

  // Helper fetch function that automatically injects Bearer token
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    let response = await fetch(url, { ...options, headers });

    // Handle token expiry transparently
    if (response.status === 401 && accessToken) {
      await refreshTokens();
      const newAccessToken = localStorage.getItem('settl_access_token');
      if (newAccessToken) {
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
