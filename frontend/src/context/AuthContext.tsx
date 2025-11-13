import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "@/services/auth";
import { User } from "@/types/models";

interface AuthContextType {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  logout: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  loggedIn: false,
  setLoggedIn: () => {},
  logout: () => {},
  user: null,
  setUser: () => {},
  loading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, verify token (if present) and fetch current user.
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        // No token, ensure clean state
        if (mounted) {
          setLoggedIn(false);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Try to fetch current user to validate token
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setLoggedIn(true);
        }
      } catch (err) {
        // Token invalid or request failed -> clear auth
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        if (mounted) {
          setUser(null);
          setLoggedIn(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Logout helper that clears stored tokens and context state
  const logout = () => {
    authService.logout();
    setLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, logout, user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
