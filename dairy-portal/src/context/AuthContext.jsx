import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import endpoints from "../api/endpoints";
import AuthContext from "./authContextDef";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        const response = await api.get(endpoints.auth.me);
        if (isMounted) setUser(response.data?.user ?? null);
      } catch (error) {
        if (isMounted && error.response?.status !== 401) {
          setAuthError(
            error.response?.data?.message ||
              error.message ||
              "Could not verify your login session."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = async () => {
    try {
      await api.post(endpoints.auth.logout);
    } finally {
      setUser(null);
      setAuthError("");
    }
  };

  const login = (userData) => {
    setUser(userData);
    setAuthError("");
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      authError,
      login,
      logout,
    }),
    [user, isLoading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
