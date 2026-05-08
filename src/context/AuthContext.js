import React, { createContext, useState, useContext, useEffect } from 'react';
const AuthContext = createContext(null);

const getSupabase = async () => {
  const module = await import('../supabaseClient');
  return module.supabase;
};

const getActivityLogger = async () => import('../utils/activityLogger');
const getPermissions = async () => import('../utils/permissions');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const currentPath = window.location.pathname;
      const storedUser = localStorage.getItem('deepskill_user');

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.authType !== 'supabase_admin') {
          setUser(parsed);
          setLoading(false);
          return;
        }
      }

      const shouldCheckSupabaseSession = currentPath.startsWith('/admin') || storedUser;

      if (!shouldCheckSupabaseSession) {
        setLoading(false);
        return;
      }

      const supabase = await getSupabase();
      const { ADMIN_FULL_PERMISSIONS } = await getPermissions();

      // 1. Check Supabase session first (for Admin)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const adminUser = {
          id: session.user.id,
          email: session.user.email,
          name: 'Administrator',
          role: 'admin',
          permissions: { ...ADMIN_FULL_PERMISSIONS },
          authType: 'supabase_admin'
        };
        setUser(adminUser);
        localStorage.setItem('deepskill_user', JSON.stringify(adminUser));
      } else {
        // 2. If no Supabase session, check for CNIC session in localStorage
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.authType === 'supabase_admin') {
            setUser(null);
            localStorage.removeItem('deepskill_user');
          } else {
            setUser(parsed);
          }
        }
      }
      setLoading(false);
    };

    checkSession();

    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/admin')) {
      return undefined;
    }

    let subscription;

    getSupabase().then(async (supabase) => {
      const { ADMIN_FULL_PERMISSIONS } = await getPermissions();
      // Listen for Auth changes
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          const adminUser = {
            id: session.user.id,
            email: session.user.email,
            name: 'Administrator',
            role: 'admin',
            permissions: { ...ADMIN_FULL_PERMISSIONS },
            authType: 'supabase_admin'
          };
          setUser(adminUser);
          localStorage.setItem('deepskill_user', JSON.stringify(adminUser));
        } else {
          const stored = localStorage.getItem('deepskill_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.authType === 'supabase_admin') {
              setUser(null);
              localStorage.removeItem('deepskill_user');
            }
          }
        }
      });
      subscription = result.data.subscription;
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (cnic) => {
    try {
      const supabase = await getSupabase();
      const { logActivity, updateLastLogin } = await getActivityLogger();
      const { resolvePermissions } = await getPermissions();

      // 1. Check allowed_cnics first to determine role and existence
      const { data: roleData, error: roleError } = await supabase
        .from('allowed_cnics')
        .select('*')
        .eq('cnic', cnic)
        .single();
      
      if (roleError || !roleData) {
        await logActivity({
          userId: null,
          userName: cnic,
          userRole: 'unknown',
          eventType: 'warning',
          description: `Failed login attempt with CNIC: ${cnic}`
        });
        throw new Error('Access denied. No account found for this CNIC.');
      }

      // 2. Role-specific logic
      if (roleData.role === 'teacher') {
        // Teachers: Check status in teachers table
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('id,status')
          .eq('cnic', cnic)
          .single();
        
        if (teacherError || !teacherData) {
          throw new Error('Teacher profile not found.');
        }

        if (teacherData.status !== 'Active') {
          throw new Error(`Your account is ${teacherData.status.toLowerCase()}. Please contact the administrator.`);
        }

        const userData = {
          ...roleData,
          id: teacherData.id || roleData.id,
          name: roleData.name,
          status: teacherData.status,
          authType: 'cnic',
          permissions: {}
        };
        setUser(userData);
        localStorage.setItem('deepskill_user', JSON.stringify(userData));
        await updateLastLogin(cnic);
        await logActivity({
          userId: userData.id || null,
          userName: userData.name,
          userRole: userData.role,
          eventType: 'login',
          description: 'Logged in'
        });
        return userData;

      } else if (roleData.role === 'student') {
        // Students: Check status in admissions table
        const { data: admission, error: admError } = await supabase
          .from('admissions')
          .select('*')
          .eq('cnic', cnic)
          .single();

        if (admError || !admission) {
          throw new Error('Student admission record not found.');
        }

        if (!['Active', 'Graduated'].includes(admission.status)) {
          throw new Error(`Your admission is ${admission.status.toLowerCase()}. Please contact the administrator.`);
        }

        const userData = {
          ...roleData,
          id: admission.id || roleData.id,
          name: roleData.name,
          status: admission.status,
          authType: 'cnic',
          permissions: {}
        };
        setUser(userData);
        localStorage.setItem('deepskill_user', JSON.stringify(userData));
        await updateLastLogin(cnic);
        await logActivity({
          userId: userData.id || null,
          userName: userData.name,
          userRole: userData.role,
          eventType: 'login',
          description: 'Logged in'
        });
        return userData;
      } else {
        const { data: directoryUser, error: userError } = await supabase
          .from('users')
          .select('*, custom_roles(*)')
          .eq('cnic', cnic)
          .maybeSingle();

        if (userError || !directoryUser) {
          await logActivity({
            userId: null,
            userName: cnic,
            userRole: roleData.role,
            eventType: 'warning',
            description: `Failed login attempt with CNIC: ${cnic}`
          });
          throw new Error('User directory record not found.');
        }

        if (directoryUser.status !== 'active') {
          throw new Error(`Your account is ${directoryUser.status}. Please contact the administrator.`);
        }

        let resolvedRole = directoryUser.custom_roles;
        if (!resolvedRole && ['hr_manager', 'accountant', 'receptionist', 'blog'].includes(directoryUser.role)) {
          const displayName = directoryUser.role.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
          const { data: fallbackRole } = await supabase.from('custom_roles').select('*').ilike('name', displayName).maybeSingle();
          resolvedRole = fallbackRole || null;
        }

        const userData = {
          id: directoryUser.id,
          cnic: directoryUser.cnic,
          email: directoryUser.email,
          phone: directoryUser.phone,
          name: directoryUser.full_name,
          role: directoryUser.role,
          status: directoryUser.status,
          customRoleId: directoryUser.custom_role_id,
          permissions: resolvePermissions(directoryUser, resolvedRole),
          authType: 'cnic'
        };

        setUser(userData);
        localStorage.setItem('deepskill_user', JSON.stringify(userData));
        await updateLastLogin(cnic);
        await logActivity({
          userId: userData.id,
          userName: userData.name,
          userRole: userData.role,
          eventType: 'login',
          description: 'Logged in'
        });
        return userData;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (applicationData) => {
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase
        .from('admissions')
        .insert([{
          ...applicationData,
          status: 'Pending',
          submitted_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };


  const logout = async () => {
    const { logActivity } = await getActivityLogger();

    if (user) {
      await logActivity({
        userId: user.id || null,
        userName: user.name || user.full_name || 'Unknown',
        userRole: user.role || 'unknown',
        eventType: 'logout',
        description: 'Logged out'
      });
    }

    if (user?.authType === 'supabase_admin') {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('deepskill_user');
  };

  const updateProfile = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('deepskill_user', JSON.stringify(newUser));
  };

  const enrollCourse = (course) => {
    if (!user) return;
    
    const isAlreadyEnrolled = user.enrolledCourses?.some(c => c.id === course.id);
    if (isAlreadyEnrolled) return;

    const updatedUser = {
      ...user,
      enrolledCourses: [...(user.enrolledCourses || []), {
        ...course,
        progress: 0,
        joined: new Date().toISOString().split('T')[0]
      }]
    };
    setUser(updatedUser);
    localStorage.setItem('deepskill_user', JSON.stringify(updatedUser));
  };

  const unenrollCourse = (courseId) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      enrolledCourses: user.enrolledCourses.filter(c => c.id !== courseId)
    };
    setUser(updatedUser);
    localStorage.setItem('deepskill_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, updateProfile, enrollCourse, unenrollCourse, loading, register 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
