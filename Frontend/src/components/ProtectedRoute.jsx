import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user's role is allowed
  const userRole = user.role || (user.userType === 'editor' ? 'editor' : 'reader');
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to home if not authorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
