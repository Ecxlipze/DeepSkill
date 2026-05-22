import React, { createContext, useState, useContext, useEffect } from 'react';
const AuthContext = createContext(null);

const getSupabase = async () => {
  const module = await import('../supabaseClient');
  return module.supabase;
};

const getActivityLogger = async () => import('../utils/activityLogger');
const getPermissions = async () => import('../utils/permissions');

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Request failed.');
  }
  return result;
};

const clearStoredSupabaseAuth = () => {
  if (typeof window === 'undefined') return;

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
      localStorage.removeItem(key);
    }
  });
};

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
      let session = null;
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        session = data.session;
      } catch (error) {
        if (error?.message?.toLowerCase().includes('refresh token')) {
          await supabase.auth.signOut({ scope: 'local' });
          clearStoredSupabaseAuth();
          localStorage.removeItem('deepskill_user');
        } else {
          throw error;
        }
      }
      
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

  const requestLoginOtp = async (cnic) => postJson('/api/auth/send-otp.php', { cnic });

  const verifyLoginOtp = async (cnic, otp) => postJson('/api/auth/verify-otp.php', { cnic, otp });

  const login = async (cnic, options = {}) => {
    try {
      if (!options.verificationToken) {
        throw new Error('Email OTP verification is required before login.');
      }

      await postJson('/api/auth/validate-token.php', {
        cnic,
        verificationToken: options.verificationToken
      });

      const [
        supabase,
        { logActivity, updateLastLogin },
        { resolvePermissions }
      ] = await Promise.all([
        getSupabase(),
        getActivityLogger(),
        getPermissions()
      ]);

      const recordLoginAudit = (userData) => {
        Promise.allSettled([
          updateLastLogin(cnic),
          logActivity({
            userId: userData.id || null,
            userName: userData.name,
            userRole: userData.role,
            eventType: 'login',
            description: 'Logged in'
          })
        ]);
      };

      // 1. Check allowed_cnics first to determine role and existence.
      // Registered students are intentionally not added here until admin approval.
      const { data: roleData, error: roleError } = await supabase
        .from('allowed_cnics')
        .select('*')
        .eq('cnic', cnic)
        .maybeSingle();
      
      if (roleError || !roleData) {
        const { data: latestAdmission } = await supabase
          .from('admissions')
          .select('status')
          .eq('cnic', cnic)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        Promise.resolve(logActivity({
          userId: null,
          userName: cnic,
          userRole: 'unknown',
          eventType: 'warning',
          description: `Failed login attempt with CNIC: ${cnic}`
        }));

        if (latestAdmission?.status) {
          const status = latestAdmission.status.toLowerCase();
          if (status === 'pending') {
            throw new Error('Your registration is pending admin approval. You can log in after your admission is approved.');
          }
          throw new Error(`Your admission is ${status}. Please contact the administrator.`);
        }

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
        recordLoginAudit(userData);
        return userData;

      } else if (roleData.role === 'student') {
        // Students: Check status in admissions table
        const { data: admission, error: admError } = await supabase
          .from('admissions')
          .select('*')
          .eq('cnic', cnic)
          .in('status', ['Active', 'Graduated'])
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

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
          assigned_course: admission.course || roleData.assigned_course,
          course: admission.course || roleData.assigned_course,
          batch: admission.batch || roleData.batch,
          batch_timing: admission.batch_timing || roleData.batch_timing,
          status: admission.status,
          authType: 'cnic',
          permissions: {}
        };
        setUser(userData);
        localStorage.setItem('deepskill_user', JSON.stringify(userData));
        recordLoginAudit(userData);
        return userData;
      } else {
        const { data: directoryUser, error: userError } = await supabase
          .from('users')
          .select('*, custom_roles(*)')
          .eq('cnic', cnic)
          .maybeSingle();

        if (userError || !directoryUser) {
          Promise.resolve(logActivity({
            userId: null,
            userName: cnic,
            userRole: roleData.role,
            eventType: 'warning',
            description: `Failed login attempt with CNIC: ${cnic}`
          }));
          throw new Error('User directory record not found.');
        }

        if (directoryUser.status !== 'active') {
          throw new Error(`Your account is ${directoryUser.status}. Please contact the administrator.`);
        }

        const resolvedRole = directoryUser.custom_roles;

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
        recordLoginAudit(userData);
        return userData;
      }
    } catch (error) {
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
      const response = await fetch('/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || error.message || 'Registration failed.');
      }
      return result.data || result.user || result;
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

  return (
    <AuthContext.Provider value={{ 
      user, login, requestLoginOtp, verifyLoginOtp, logout, updateProfile, loading, register
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
