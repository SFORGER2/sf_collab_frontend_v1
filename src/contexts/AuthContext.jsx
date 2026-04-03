import React, { createContext, useContext, useState, useEffect } from "react";
import { SimpleOAuthService } from "../services/simpleOAuthService";
import { useSocket } from "./SocketContext";
import axios from "axios";

const API_URL_AUTH = import.meta.env.VITE_API_URL_AUTH || 'http://localhost:5000/api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { disconnectSocket } = useSocket();

  // 1. Setup Axios defaults whenever the token changes
  const setSession = (token, userData) => {
    if (token) {
      localStorage.setItem("access_token", token);
      // This ensures any axios call made AFTER this line has the header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("access_token");
      delete axios.defaults.headers.common["Authorization"];
    }

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Re-attach header on refresh
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_URL_AUTH}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const token = data.tokens?.accessToken;
      const userData = data.user;

      if (!token) throw new Error("No access token returned from server");

      setSession(token, userData);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(`${API_URL_AUTH}/signup`, userData);

      if (response.status === 201 && response.data?.user) {
        const token = response.data.tokens?.accessToken;
        const returnedUser = response.data.user;

        setSession(token, returnedUser);
        if (response.data.tokens?.refreshToken) {
            localStorage.setItem("refreshToken", response.data.tokens.refreshToken);
        }

        setUser(returnedUser);
        setIsAuthenticated(true);
        return { success: true, user: returnedUser };
      }
      return { success: false, error: "Signup failed" };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message || "Signup failed",
      };
    }
  };

  const logout = () => {
    setSession(null, null);
    localStorage.removeItem("refreshToken");
    disconnectSocket?.();
    setUser(null);
    setIsAuthenticated(false);
  };

  // ... (keep loginWithGoogle and handleOAuthCallback as they were)

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    signup,
    logout,
    // Add these back if needed
    loginWithGoogle,
    handleOAuthCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};