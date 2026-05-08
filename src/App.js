import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import GlobalStyle from './GlobalStyle';
import Header from './Header';
import Footer from './Footer';
import CustomCursor from './CustomCursor';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import FounderMessage from './FounderMessage';
import TraineePage from './TraineePage';
import ContactPage from './ContactPage';
import MediaPage from './MediaPage';
import CoursesPage from './CoursesPage';
import FullStackPage from './FullStackPage';
import WordPressPage from './WordPressPage';
import LaravelPage from './LaravelPage';
import GraphicPage from './GraphicPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProfilePage from './ProfilePage';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import MediaLibrary from './admin/MediaLibrary';
import CourseManager from './admin/CourseManager';
import TestimonialManager from './admin/TestimonialManager';
import ContentManager from './admin/ContentManager';
import TeacherManager from './admin/TeacherManager';
import TeacherProfile from './admin/TeacherProfile';
import MediaPageManager from './admin/MediaPageManager';
import EnrollmentManager from './admin/EnrollmentManager';
import VerifyCertificatePage from './VerifyCertificatePage';
import CertificateManager from './admin/CertificateManager';
import AdminUserManagement from './admin/AdminUserManagement';
import AdminActivityLogsPage from './admin/AdminActivityLogsPage';
import StudentManager from './admin/StudentManager';
import StudentProfile from './admin/StudentProfile';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import AssignTask from './teacher/AssignTask';
import ViewTasks from './teacher/ViewTasks';
import StudentTasks from './student/StudentTasks';
import StudentProgress from './student/StudentProgress';
import StudentCertificate from './student/StudentCertificate';
import StudentComplaints from './student/StudentComplaints';
import TeacherComplaints from './teacher/TeacherComplaints';
import AdminComplaints from './admin/AdminComplaints';
import StudentGroupChat from './student/StudentGroupChat';
import TeacherGroupChat from './teacher/TeacherGroupChat';
import AdminFinance from './admin/FinanceManager';
import AdminFinanceTransactions from './admin/TransactionHistory';
import {
  AdminReports
} from './admin/AdminPlaceholders';
import AdminAnnouncements from './admin/AdminAnnouncements';
import TeacherAnnouncements from './teacher/TeacherAnnouncements';
import StudentAnnouncements from './student/StudentAnnouncements';
import StudentFinance from './student/StudentFinance';
import TeacherFinance from './teacher/TeacherFinance';
import TeacherAttendance from './teacher/TeacherAttendance';
import TeacherHRPage from './teacher/TeacherHRPage';
import AdminAttendancePage from './admin/AdminAttendance';
import AdminHRManagement from './admin/AdminHRManagement';
import StudentAttendance from './student/StudentAttendance';
import ReferralPage from './components/ReferralPage';
import AdminReferral from './admin/AdminReferral';
import StudentResults from './student/StudentResults';
import AdminResults from './admin/AdminResults';
import NewEnrollment from './student/NewEnrollment';
import CourseDetailPage from './admin/CourseDetailPage';

import ScrollProgressBar from './components/ScrollProgressBar';
import GoToTopButton from './components/GoToTopButton';

import { AnimatePresence } from 'framer-motion';
import GlobalOverlay from './components/GlobalOverlay';
import PageTransition from './components/PageTransition';
import { useAuth } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';
import { ComplaintsProvider } from './context/ComplaintsContext';
import { GroupChatProvider } from './context/GroupChatContext';
import { AnnouncementsProvider } from './context/AnnouncementsContext';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionGuard from './components/PermissionGuard';
import ResetPasswordModal from './components/ResetPasswordModal';
import PremiumLoader from './components/PremiumLoader';


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

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Initial Splash Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 1000); // Shortened initial load
    return () => clearTimeout(timer);
  }, []);

  const isDashboardRoute =
    location.pathname.startsWith('/student') ||
    location.pathname.startsWith('/teacher') ||
    location.pathname.startsWith('/admin');

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111318',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.9rem',
            padding: '12px 20px',
            borderRadius: '10px',
          },
          success: {
            iconTheme: {
              primary: '#2ecc71',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#e74c3c',
              secondary: '#fff',
            },
          }
        }}
      />
      <PremiumLoader loading={isAppLoading} />
      <ResetPasswordModal user={user} isOpen={user?.is_first_login} />
      <ScrollToTop />
      <GlobalStyle />
      <GlobalOverlay />
      {!isDashboardRoute && <ScrollProgressBar />}
      {!isDashboardRoute && <GoToTopButton />}
      <CustomCursor />

      {!isDashboardRoute && <Header />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/courses" element={<PageTransition><CoursesPage /></PageTransition>} />
          <Route path="/media" element={<PageTransition><MediaPage /></PageTransition>} />
          <Route path="/full-stack-react" element={<PageTransition><FullStackPage /></PageTransition>} />
          <Route path="/wordpress-mastery" element={<PageTransition><WordPressPage /></PageTransition>} />
          <Route path="/laravel-mastery" element={<PageTransition><LaravelPage /></PageTransition>} />
          <Route path="/graphic-design" element={<PageTransition><GraphicPage /></PageTransition>} />
          <Route path="/founder-message" element={<PageTransition><FounderMessage /></PageTransition>} />
          <Route path="/trainers" element={<PageTransition><TraineePage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentDashboard /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/tasks"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentTasks /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/progress"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentProgress /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/finance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentFinance /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/certificate"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentCertificate /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/complaints"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentComplaints /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentAttendance /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:type"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentResults /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/new-enrollment"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><NewEnrollment /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/group-chat"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentGroupChat /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/announcements"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><StudentAnnouncements /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/referral"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <PageTransition><ReferralPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><TeacherDashboard /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/complaints"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><TeacherComplaints /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/finance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><TeacherFinance /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><TeacherAttendance /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/referral"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><ReferralPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/group-chat"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><TeacherGroupChat /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/announcements"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><TeacherAnnouncements /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/hr"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><TeacherHRPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/tasks/assign"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><AssignTask /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/tasks/view"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <PageTransition><ViewTasks /></PageTransition>
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
          <Route path="/admin/dashboard" element={<PermissionGuard allowedRoles={['admin','hr_manager','accountant','receptionist','custom']} permissionKey="dashboard"><PageTransition><AdminDashboard /></PageTransition></PermissionGuard>} />

          {/* Admin Management */}
          <Route path="/admin/students" element={<PermissionGuard allowedRoles={['admin','hr_manager','accountant','receptionist','custom']} permissionKey="students"><PageTransition><StudentManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/students/:id" element={<PageTransition><StudentProfile /></PageTransition>} />
          <Route path="/admin/users" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="users"><PageTransition><AdminUserManagement /></PageTransition></PermissionGuard>} />
          <Route path="/admin/users/activity" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="users"><PageTransition><AdminActivityLogsPage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/teachers" element={<PermissionGuard allowedRoles={['admin','hr_manager','accountant','receptionist','custom']} permissionKey="teachers"><PageTransition><TeacherManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/teachers/:id" element={<PageTransition><TeacherProfile /></PageTransition>} />
          <Route path="/admin/courses" element={<PermissionGuard allowedRoles={['admin','receptionist','custom']} permissionKey="courses"><PageTransition><CourseManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/courses/:courseId" element={<PageTransition><CourseDetailPage /></PageTransition>} />
          <Route path="/admin/batches" element={<PageTransition><CourseManager /></PageTransition>} />
          <Route path="/admin/attendance" element={<PermissionGuard allowedRoles={['admin','hr_manager','receptionist','custom']} permissionKey="attendance"><PageTransition><AdminAttendancePage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/certificates" element={<PageTransition><CertificateManager /></PageTransition>} />
          <Route path="/admin/admissions" element={<PermissionGuard allowedRoles={['admin','hr_manager','receptionist','custom']} permissionKey="students"><PageTransition><EnrollmentManager /></PageTransition></PermissionGuard>} />
          <Route
            path="/admin/hr"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageTransition><AdminHRManagement /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin Communication */}
          <Route path="/admin/announcements" element={<PermissionGuard allowedRoles={['admin','hr_manager','receptionist','custom']} permissionKey="announcements"><PageTransition><AdminAnnouncements /></PageTransition></PermissionGuard>} />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageTransition><AdminComplaints /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin Finance & Growth */}
          <Route path="/admin/finance" element={<PermissionGuard allowedRoles={['admin','accountant','custom']} permissionKey="finance"><PageTransition><AdminFinance /></PageTransition></PermissionGuard>} />
          <Route path="/admin/finance/transactions" element={<PermissionGuard allowedRoles={['admin','accountant','custom']} permissionKey="finance"><PageTransition><AdminFinanceTransactions /></PageTransition></PermissionGuard>} />
          <Route path="/admin/referral" element={<PermissionGuard allowedRoles={['admin','accountant','custom']} permissionKey="referral"><PageTransition><AdminReferral /></PageTransition></PermissionGuard>} />

          {/* Admin System & Settings */}
          <Route path="/admin/reports" element={<PermissionGuard allowedRoles={['admin','hr_manager','accountant','custom']} permissionKey="reports"><PageTransition><AdminReports /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/testimonials" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><TestimonialManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/media" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><MediaLibrary /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/content" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><ContentManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/media-page" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><MediaPageManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/results" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="results"><PageTransition><AdminResults /></PageTransition></PermissionGuard>} />

          <Route path="/verify-certificate" element={<PageTransition><VerifyCertificatePage /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      {!isDashboardRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <TasksProvider>
        <ComplaintsProvider>
          <GroupChatProvider>
            <AnnouncementsProvider>
              <AppContent />
            </AnnouncementsProvider>
          </GroupChatProvider>
        </ComplaintsProvider>
      </TasksProvider>
    </Router>
  );
}

export default App;
