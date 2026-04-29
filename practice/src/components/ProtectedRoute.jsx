import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('auth-token');
  
  // If there's an auth token, allow access to nested routes via Outlet
  // Otherwise, redirect to the admin-login page
  return token ? <Outlet /> : <Navigate to="/admin-login" />;
};

export default ProtectedRoute;
