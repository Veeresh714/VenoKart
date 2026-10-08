import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios";

// createContext() creates a "channel" that provider/consumer components
// can communicate through, without passing props manually at every level.
const AuthContext = createContext();

// The Provider component wraps our whole app (see App.jsx) and makes
// auth state + functions available to every component inside it.
export const AuthProvider = ({ children }) => {
  // Lazy initial state: read from localStorage ONCE when the app first
  // loads, so a page refresh doesn't log the user out.
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("userInfo");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // Runs whenever "user" changes - keeps localStorage in sync with state,
  // so a page refresh always restores the latest logged-in user.
  useEffect(() => {
    if (user) {
      localStorage.setItem("userInfo", JSON.stringify(user));
    } else {
      localStorage.removeItem("userInfo");
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data); // data includes { _id, name, email, role, token }
      return { success: true };
    } catch (error) {
      // error.response?.data?.message is how our backend's error format
      // (from errorMiddleware.js) surfaces here. The "?." (optional chaining)
      // prevents a crash if error.response is undefined (e.g. network error).
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (updates) => {
    const { data } = await api.put("/api/auth/profile", updates);
    // Merge updated fields into current user state, but KEEP the existing
    // token (the profile update response doesn't include one).
    setUser((prev) => ({ ...prev, ...data }));
    return data;
  };

  // The "value" object is what every consuming component receives when
  // they call useAuth() below.
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook: instead of every component writing
// "useContext(AuthContext)" and importing AuthContext directly, they just
// call useAuth(). Cleaner imports and a single place to add safety checks.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
