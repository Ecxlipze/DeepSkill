export const MODULE_KEYS = [
  'dashboard',
  'students',
  'teachers',
  'courses',
  'attendance',
  'tasks',
  'results',
  'finance',
  'complaints',
  'announcements',
  'blog',
  'referral',
  'reports',
  'hr',
  'users',
  'settings'
];

export const ADMIN_FULL_PERMISSIONS = MODULE_KEYS.reduce((acc, key) => {
  acc[key] = 'full';
  return acc;
}, {});

export const BUILTIN_ROLE_COLORS = {
  student: 'blue',
  teacher: 'green',
  admin: 'charcoal',
  hr_manager: 'purple',
  accountant: 'amber',
  receptionist: 'pink',
  blog: 'green',
  custom: 'gray'
};

export const ROLE_COLOR_STYLES = {
  blue: { bg: 'rgba(79, 142, 247, 0.14)', text: '#4F8EF7', border: 'rgba(79, 142, 247, 0.25)' },
  green: { bg: 'rgba(46, 204, 113, 0.14)', text: '#2ecc71', border: 'rgba(46, 204, 113, 0.25)' },
  charcoal: { bg: 'rgba(156, 163, 175, 0.14)', text: '#d1d5db', border: 'rgba(156, 163, 175, 0.25)' },
  purple: { bg: 'rgba(147, 51, 234, 0.14)', text: '#c084fc', border: 'rgba(147, 51, 234, 0.25)' },
  amber: { bg: 'rgba(245, 158, 11, 0.14)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.25)' },
  pink: { bg: 'rgba(236, 72, 153, 0.14)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.25)' },
  gray: { bg: 'rgba(107, 114, 128, 0.14)', text: '#9ca3af', border: 'rgba(107, 114, 128, 0.25)' }
};

export const STAFF_ROLES = ['admin', 'hr_manager', 'accountant', 'receptionist', 'blog', 'custom'];

export const BUILTIN_ROLE_NAMES = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Admin',
  hr_manager: 'HR Manager',
  accountant: 'Accountant',
  receptionist: 'Receptionist',
  blog: 'Blog',
  custom: 'Custom'
};

const normalizePermissionMap = (permissions = {}) =>
  MODULE_KEYS.reduce((acc, key) => {
    acc[key] = permissions[key] || 'none';
    return acc;
  }, {});

export const getBuiltinPermissions = (role) => {
  if (role === 'admin') {
    return { ...ADMIN_FULL_PERMISSIONS };
  }

  if (role === 'blog') {
    return normalizePermissionMap({ blog: 'full' });
  }

  if (role === 'student' || role === 'teacher') {
    return {};
  }

  return normalizePermissionMap();
};

export const resolvePermissions = (user, customRole) => {
  if (!user) return {};
  if (user.role === 'admin') return getBuiltinPermissions('admin');
  if (user.role === 'student' || user.role === 'teacher') return {};
  if (user.role === 'blog' && !customRole) return getBuiltinPermissions('blog');
  return normalizePermissionMap(customRole?.permissions || user.permissions || {});
};

export const canAccess = (permissions = {}, key, minimum = 'view') => {
  const current = permissions?.[key] || 'none';
  if (current === 'full') return true;
  if (minimum === 'view' && current === 'view') return true;
  return false;
};

export const getFirstAccessibleAdminPath = (permissions = {}) => {
  const routeOrder = [
    { key: 'dashboard', path: '/admin/dashboard' },
    { key: 'students', path: '/admin/admissions' },
    { key: 'teachers', path: '/admin/teachers' },
    { key: 'hr', path: '/admin/hr' },
    { key: 'users', path: '/admin/users' },
    { key: 'courses', path: '/admin/courses' },
    { key: 'attendance', path: '/admin/attendance' },
    { key: 'announcements', path: '/admin/announcements' },
    { key: 'blog', path: '/admin/blog' },
    { key: 'complaints', path: '/admin/complaints' },
    { key: 'finance', path: '/admin/finance' },
    { key: 'referral', path: '/admin/referral' },
    { key: 'results', path: '/admin/results' },
    { key: 'reports', path: '/admin/reports' },
    { key: 'settings', path: '/admin/settings/testimonials' }
  ];

  const match = routeOrder.find((item) => canAccess(permissions, item.key, 'view'));
  return match?.path || '/login';
};

export const getRoleColor = (role, customRoleColor) => {
  const colorKey = customRoleColor || BUILTIN_ROLE_COLORS[role] || 'gray';
  return ROLE_COLOR_STYLES[colorKey] || ROLE_COLOR_STYLES.gray;
};

export const getRoleLabel = (role, customRoleName) => customRoleName || BUILTIN_ROLE_NAMES[role] || 'Custom';

export const buildAdminSidebar = (user, permissions = {}, hasOpenComplaints = false) => {
  const baseItems = [
    { type: 'label', label: 'MAIN' },
    { iconKey: 'home', label: 'Dashboard', path: '/admin/dashboard', permissionKey: 'dashboard' },
    { iconKey: 'admissions', label: 'Admissions', path: '/admin/admissions', permissionKey: 'students' },
    { type: 'label', label: 'MANAGEMENT' },
    { iconKey: 'students', label: 'Students', path: '/admin/students', permissionKey: 'students' },
    { iconKey: 'teachers', label: 'Teachers', path: '/admin/teachers', permissionKey: 'teachers' },
    { iconKey: 'hr', label: 'HR Management', path: '/admin/hr', permissionKey: 'hr' },
    {
      iconKey: 'users',
      label: 'User Management',
      type: 'dropdown',
      permissionKey: 'users',
      items: [
        { label: 'Overview', path: '/admin/users', permissionKey: 'users' },
        { label: 'Activity Logs', path: '/admin/users/activity', permissionKey: 'users' }
      ]
    },
    { iconKey: 'courses', label: 'Courses & Batches', path: '/admin/courses', permissionKey: 'courses' },
    { iconKey: 'attendance', label: 'Attendance', path: '/admin/attendance', permissionKey: 'attendance' },
    { iconKey: 'results', label: 'Certificates', path: '/admin/certificates', permissionKey: 'results' },
    { type: 'label', label: 'COMMUNICATION' },
    { iconKey: 'announcements', label: 'Announcements', path: '/admin/announcements', permissionKey: 'announcements' },
    { iconKey: 'blog', label: 'Blog', path: '/admin/blog', permissionKey: 'blog' },
    { iconKey: 'complaints', label: 'Complaints', path: '/admin/complaints', permissionKey: 'complaints', badge: hasOpenComplaints },
    { type: 'label', label: 'FINANCE' },
    {
      iconKey: 'finance',
      label: 'Finance',
      type: 'dropdown',
      permissionKey: 'finance',
      items: [
        { label: 'Overview', path: '/admin/finance', permissionKey: 'finance' },
        { label: 'Transactions', path: '/admin/finance/transactions', permissionKey: 'finance' }
      ]
    },
    { type: 'label', label: 'GROWTH' },
    { iconKey: 'referral', label: 'Referral Program', path: '/admin/referral', permissionKey: 'referral' },
    { type: 'label', label: 'SYSTEM' },
    { iconKey: 'results', label: 'Exam Results', path: '/admin/results', permissionKey: 'results' },
    { iconKey: 'reports', label: 'Reports', path: '/admin/reports', permissionKey: 'reports' },
    {
      iconKey: 'settings',
      label: 'Settings',
      type: 'dropdown',
      permissionKey: 'settings',
      items: [
        { label: 'Testimonials', path: '/admin/settings/testimonials', permissionKey: 'settings' },
        { label: 'Media Library', path: '/admin/settings/media', permissionKey: 'settings' },
        { label: 'Site Content', path: '/admin/settings/content', permissionKey: 'settings' },
        { label: 'Media Page', path: '/admin/settings/media-page', permissionKey: 'settings' }
      ]
    }
  ];

  if (user?.role === 'admin') {
    return baseItems;
  }

  const filtered = [];
  baseItems.forEach((item) => {
    if (item.type === 'label') {
      filtered.push(item);
      return;
    }

    if (item.type === 'dropdown') {
      const visibleItems = (item.items || []).filter((child) => canAccess(permissions, child.permissionKey || item.permissionKey, 'view'));
      if (visibleItems.length > 0 && canAccess(permissions, item.permissionKey, 'view')) {
        filtered.push({ ...item, items: visibleItems });
      }
      return;
    }

    if (canAccess(permissions, item.permissionKey, 'view')) {
      filtered.push(item);
    }
  });

  return filtered.filter((item, index, arr) => item.type !== 'label' || (arr[index + 1] && arr[index + 1].type !== 'label'));
};
