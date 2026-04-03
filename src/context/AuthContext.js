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

  const login = (email, password) => {
    // Mock login logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Any email/pass works for this mock demo, but let's simulate a check
        if (email && password) {
          const userData = {
            id: '123',
            email: email,
            name: email.split('@')[0],
            role: 'student',
            enrolledCourses: [], // Start with empty list as requested
            totalLearningTime: '0h'
          };
          setUser(userData);
          localStorage.setItem('deepskill_user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };

  const register = (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...userData,
          id: Date.now().toString(),
          role: 'student',
          enrolledCourses: [],
          totalLearningTime: '0h'
        };
        setUser(newUser);
        localStorage.setItem('deepskill_user', JSON.stringify(newUser));
        resolve(newUser);
      }, 1000);
    });
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
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, enrollCourse, unenrollCourse, loading }}>
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
