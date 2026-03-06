import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 🔹 Decode JWT manually
  const decodeToken = (token) => {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      return null;
    }
  };

  const getInitialToken = () => localStorage.getItem("token") || null;
  const getInitialUser = () => {
    const token = getInitialToken();
    return token ? decodeToken(token) : null;
  };

  const [token, setToken] = useState(getInitialToken);
  const [user, setUser] = useState(getInitialUser);

  // 🔹 Login
  const login = (tokenFromServer) => {
    localStorage.setItem("token", tokenFromServer);
    setToken(tokenFromServer);

    const decoded = decodeToken(tokenFromServer);
    setUser(decoded);
  };

  // 🔹 Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.role === "admin",
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);