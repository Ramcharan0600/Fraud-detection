import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    const t = localStorage.getItem("token");
    if (u && t) {
      try {
        setUser(JSON.parse(u));
      } catch (e) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else {
      // Clear both if either is missing
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    setUser(data.data.user);
  };
  
  const register = async (name, email, password) => {
    // In real-world apps, registration often doesn't auto-login
    const { data } = await api.post("/auth/register", { name, email, password });
    return data; // Return message for the UI
  };

  const updateProfile = async (updates) => {
    const { data } = await api.put("/users/profile", updates);
    localStorage.setItem("user", JSON.stringify(data.data));
    setUser(data.data);
    return data.data;
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, login, register, updateProfile, logout, loading }}>{children}</Ctx.Provider>;
}
