import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import GlobalStyle from './GlobalStyle';
import Header from './Header';
import Footer from './Footer';
import CustomCursor from './CustomCursor';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import RegisterPage from './RegisterPage';
import FounderMessage from './FounderMessage';
import TraineePage from './TraineePage';
import ContactPage from './ContactPage';
import MediaPage from './MediaPage';
import FullStackPage from './FullStackPage';
import WordPressPage from './WordPressPage';
import LaravelPage from './LaravelPage';
import GraphicPage from './GraphicPage';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import ProfilePage from './ProfilePage';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import MediaLibrary from './admin/MediaLibrary';
import CourseManager from './admin/CourseManager';
import TestimonialManager from './admin/TestimonialManager';
import ContentManager from './admin/ContentManager';
import InstructorManager from './admin/InstructorManager';
import MediaPageManager from './admin/MediaPageManager';

import ScrollProgressBar from './components/ScrollProgressBar';
import GoToTopButton from './components/GoToTopButton';

import { AnimatePresence } from 'framer-motion';
import GlobalOverlay from './components/GlobalOverlay';
import PageTransition from './components/PageTransition';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Handle ResizeObserver loop limit exceeded error
  useEffect(() => {
    const handleError = (e) => {
      if (e.message === "ResizeObserver loop completed with undelivered notifications." || 
          e.message === "ResizeObserver loop limit exceeded") {
        const resizeObserverErrGuid = document.getElementById("webpack-dev-server-client-overlay-div");
        const resizeObserverErr = document.getElementById("webpack-dev-server-client-overlay");
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute("style", "display: none");
        }
        if (resizeObserverErrGuid) {
          resizeObserverErrGuid.setAttribute("style", "display: none");
        }
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <GlobalStyle />
        <GlobalOverlay />
        <ScrollProgressBar />
        <GoToTopButton />
        <CustomCursor />
        
        <Header />
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
            <Route path="/media" element={<PageTransition><MediaPage /></PageTransition>} />
            <Route path="/full-stack-react" element={<PageTransition><FullStackPage /></PageTransition>} />
            <Route path="/wordpress-mastery" element={<PageTransition><WordPressPage /></PageTransition>} />
            <Route path="/laravel-mastery" element={<PageTransition><LaravelPage /></PageTransition>} />
            <Route path="/graphic-design" element={<PageTransition><GraphicPage /></PageTransition>} />
            <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
            <Route path="/founder-message" element={<PageTransition><FounderMessage /></PageTransition>} />
            <Route path="/trainers" element={<PageTransition><TraineePage /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <PageTransition><DashboardPage /></PageTransition>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <PageTransition><ProfilePage /></PageTransition>
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<PageTransition><AdminLogin /></PageTransition>} />
            <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
            <Route path="/admin/media" element={<PageTransition><MediaLibrary /></PageTransition>} />
            <Route path="/admin/courses" element={<PageTransition><CourseManager /></PageTransition>} />
            <Route path="/admin/testimonials" element={<PageTransition><TestimonialManager /></PageTransition>} />
            <Route path="/admin/content" element={<PageTransition><ContentManager /></PageTransition>} />
            <Route path="/admin/instructors" element={<PageTransition><InstructorManager /></PageTransition>} />
            <Route path="/admin/media-page" element={<PageTransition><MediaPageManager /></PageTransition>} />
          </Routes>
        </AnimatePresence>

        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;

