import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user info saat token ada
  useEffect(() => {
    if (token) {
      api
        .getMe(token)
        .then((response) => {
          if (response.error) {
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
          } else {
            setUser(response.user);
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      if (response.error) return { error: response.error };

      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      return { success: true };
    } catch (error) {
      return { error: "Network error" };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      if (response.error) return { error: response.error };

      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("token", response.token);
      return { success: true };
    } catch (error) {
      return { error: "Network error" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
  };

  // Update sebagian properti user, misal isOnboardingCompleted
  const updateUser = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser, // <--- ditambahkan
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
