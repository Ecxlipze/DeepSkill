import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('deepskill_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        const userData = result.user;
        setUser(userData);
        localStorage.setItem('deepskill_user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (admissionData) => {
    try {
      const response = await fetch("/api/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(admissionData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        return result;
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updatePassword = async (email, newPassword) => {
    try {
      const response = await fetch("/api/update-password.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword })
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === "success") {
        // Update local user state
        const updatedUser = { ...user, is_first_login: false };
        setUser(updatedUser);
        localStorage.setItem('deepskill_user', JSON.stringify(updatedUser));
        return result;
      } else {
        throw new Error(result.message || 'Password update failed');
      }
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  };

  const logout = () => {
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
    
    // Check if already enrolled
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
      user, login, register, updatePassword, logout, updateProfile, enrollCourse, unenrollCourse, loading 
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
