import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { canAccess, getFirstAccessibleAdminPath } from '../utils/permissions';

const getRedirectPath = (user) => {
  if (!user) return '/login';
  if (user.role === 'teacher') return '/teacher/dashboard';
  if (user.role === 'student') return '/student/dashboard';
  if (user.role === 'admin') return '/admin/dashboard';
  return getFirstAccessibleAdminPath(user.permissions || {});
};

const PermissionGuard = ({ children, allowedRoles, permissionKey, minimum = 'view' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const roleBlocked = Boolean(user && allowedRoles && !allowedRoles.includes(user.role));
  const permissionBlocked = Boolean(
    user &&
    permissionKey &&
    user.role !== 'admin' &&
    !canAccess(user.permissions || {}, permissionKey, minimum)
  );

  useEffect(() => {
    if (roleBlocked || permissionBlocked) {
      toast.error("You don't have permission to access this section.");
    }
  }, [roleBlocked, permissionBlocked]);

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#000',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roleBlocked || permissionBlocked) {
    return <Navigate to={getRedirectPath(user)} replace />;
  }

  return children;
};

export default PermissionGuard;
