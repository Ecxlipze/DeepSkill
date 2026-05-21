import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { canAccess, getFirstAccessibleAdminPath } from '../utils/permissions';

const loadingStyle = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#000',
  color: '#fff',
  fontFamily: 'Inter, sans-serif'
};

const getRedirectPath = (user, fallback = '/login') => {
  if (!user) return fallback;
  if (user.role === 'teacher') return '/teacher/dashboard';
  if (user.role === 'student') return '/student/dashboard';
  if (user.role === 'admin') return '/admin/dashboard';
  return getFirstAccessibleAdminPath(user.permissions || {});
};

const NextPortalGuard = ({
  children,
  allowedRoles,
  permissionKey,
  minimum = 'view',
  loginPath = '/login'
}) => {
  const router = useRouter();
  const { user, loading } = useAuth();

  const roleBlocked = Boolean(user && allowedRoles && !allowedRoles.includes(user.role));
  const permissionBlocked = Boolean(
    user &&
    permissionKey &&
    user.role !== 'admin' &&
    !canAccess(user.permissions || {}, permissionKey, minimum)
  );

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(loginPath);
      return;
    }

    if (roleBlocked || permissionBlocked) {
      toast.error("You don't have permission to access this section.");
      router.replace(getRedirectPath(user, loginPath));
    }
  }, [loading, user, roleBlocked, permissionBlocked, router, loginPath]);

  if (loading || !user || roleBlocked || permissionBlocked) {
    return <div style={loadingStyle}>Loading...</div>;
  }

  return children;
};

export default NextPortalGuard;
