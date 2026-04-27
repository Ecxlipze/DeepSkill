import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // 1. Check Supabase session first (for Admin)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const adminUser = {
          id: session.user.id,
          email: session.user.email,
          name: 'Administrator',
          role: 'admin'
        };
        setUser(adminUser);
        localStorage.setItem('deepskill_user', JSON.stringify(adminUser));
      } else {
        // 2. If no Supabase session, check for CNIC session in localStorage
        const storedUser = localStorage.getItem('deepskill_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          // If it was an admin but session is gone, clear it
          if (parsed.role === 'admin') {
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

    // Listen for Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const adminUser = {
          id: session.user.id,
          email: session.user.email,
          name: 'Administrator',
          role: 'admin'
        };
        setUser(adminUser);
        localStorage.setItem('deepskill_user', JSON.stringify(adminUser));
      } else {
        const stored = localStorage.getItem('deepskill_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.role === 'admin') {
            setUser(null);
            localStorage.removeItem('deepskill_user');
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (cnic) => {
    try {
      // 1. Check allowed_cnics first to determine role and existence
      const { data: roleData, error: roleError } = await supabase
        .from('allowed_cnics')
        .select('*')
        .eq('cnic', cnic)
        .single();
      
      if (roleError || !roleData) {
        throw new Error('Access denied. No account found for this CNIC.');
      }

      // 2. Role-specific logic
      if (roleData.role === 'teacher') {
        // Teachers: Check status in teachers table
        const { data: teacherData, error: teacherError } = await supabase
          .from('teachers')
          .select('status')
          .eq('cnic', cnic)
          .single();
        
        if (teacherError || !teacherData) {
          throw new Error('Teacher profile not found.');
        }

        if (teacherData.status !== 'Active') {
          throw new Error(`Your account is ${teacherData.status.toLowerCase()}. Please contact the administrator.`);
        }

        const userData = { ...roleData, status: teacherData.status };
        setUser(userData);
        localStorage.setItem('deepskill_user', JSON.stringify(userData));
        return userData;

      } else {
        // Students: Check status in admissions table
        const { data: admission, error: admError } = await supabase
          .from('admissions')
          .select('*')
          .eq('cnic', cnic)
          .single();

        if (admError || !admission) {
          throw new Error('Student admission record not found.');
        }

        if (admission.status !== 'Active') {
          throw new Error(`Your admission is ${admission.status.toLowerCase()}. Please contact the administrator.`);
        }

        const userData = { ...roleData, status: admission.status };
        setUser(userData);
        localStorage.setItem('deepskill_user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (applicationData) => {
    try {
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
    if (user?.role === 'admin') {
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
