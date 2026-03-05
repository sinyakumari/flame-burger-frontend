import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin
  if (!isAdmin) {
    return <Navigate to="/404" replace />;
  }

  // Admin access allowed
  return children;
};

export default AdminRoute;