import { useState, useMemo } from "react";
import AuthContext from "./authContextDef";

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: "Admin User",
    username: "admin",
    role: "Plant Manager",
    initials: "AD",
    plantId: "GADVASU-EDP-01",
    plantName: "Experimental Dairy Plant, GADVASU",
  });

  const logout = () => {
    setUser(null);
  };

  const login = (userData) => {
    setUser(userData);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
