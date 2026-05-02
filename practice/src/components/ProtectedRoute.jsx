import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = () => {
  const token = localStorage.getItem('auth-token');
  
  if (!token) return <Navigate to="/admin-login" />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role === 'admin') {
      return <Outlet />;
    } else {
      console.warn("User is not admin");
      return <Navigate to="/admin-login" />;
    }
  } catch (error) {
    console.error("Token invalid");
    localStorage.removeItem('auth-token');
    return <Navigate to="/admin-login" />;
  }
};

export default ProtectedRoute;
