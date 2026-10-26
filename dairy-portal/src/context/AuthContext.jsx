import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import endpoints from "../api/endpoints";
import AuthContext from "./authContextDef";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // let isMounted = true;

    // const validateSession = async () => {
    //   try {
    //     const response = await api.get("/auth/me");
    //     const authenticatedUser = getUserFromResponse(response.data);
    //     if (isMounted) setUser(authenticatedUser);
    //   } catch (error) {
    //     if (!isMounted) return;
    //     setUser(null);
    //     if (error.response?.status === 401) {
    //       sessionStorage.removeItem("authToken");
    //     }
    //     if (error.response?.status !== 401) {
    //       setAuthError(
    //         error.response?.data?.message ||
    //           error.message ||
    //           "Could not verify your login session."
    //       );
    //     }
    //   } finally {
    //     if (isMounted) setIsLoading(false);
    //   }
    // };

    // validateSession();

    // return () => {
    //   isMounted = false;
    // };
  }, []);

  const logout = async () => {
    await api.post(endpoints.auth.logout);
    sessionStorage.removeItem("authToken");
    setUser(null);
    setAuthError("");
  };

  const login = (userData, token) => {
    if (token) {
      sessionStorage.setItem("authToken", token);
    } else {
      sessionStorage.removeItem("authToken");
    }
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
