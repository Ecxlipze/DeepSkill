import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import InquiryPage from './InquiryPage';
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
import AdminAttendanceSettings from './admin/AdminAttendanceSettings';
import EnrollmentManager from './admin/EnrollmentManager';
import CounsellorPanel from './admin/CounsellorPanel';
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
import TeacherHRPage from './teacher/TeacherHRPage';
import AdminAttendancePage from './admin/AdminAttendance';
import AdminHRManagement from './admin/AdminHRManagement';
import StudentAttendance from './student/StudentAttendance';
import ReferralPage from './components/ReferralPage';
import AdminReferral from './admin/AdminReferral';
import StudentResults from './student/StudentResults';
import AdminResults from './admin/AdminResults';
import BlogManager from './admin/BlogManager';
import NewEnrollment from './student/NewEnrollment';
import CourseDetailPage from './admin/CourseDetailPage';
import DepartmentPlaceholder from './admin/DepartmentPlaceholder';

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
import { NotificationsProvider } from './hooks/useNotifications';
import { DepartmentProvider } from './context/DepartmentContext';
import ToastNotifications from './components/ToastNotifications';
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

  useEffect(() => {
    document.body.classList.toggle('ds-native-cursor', isDashboardRoute);
    return () => document.body.classList.remove('ds-native-cursor');
  }, [isDashboardRoute]);

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
      {!isDashboardRoute && <CustomCursor />}
      {isDashboardRoute && <ToastNotifications />}

      {!isDashboardRoute && <Header />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
          <Route path="/courses" element={<PageTransition><CoursesPage /></PageTransition>} />
          <Route path="/courses/full-stack-react" element={<PageTransition><FullStackPage /></PageTransition>} />
          <Route path="/courses/wordpress-mastery" element={<PageTransition><WordPressPage /></PageTransition>} />
          <Route path="/courses/laravel-mastery" element={<PageTransition><LaravelPage /></PageTransition>} />
          <Route path="/courses/graphic-design" element={<PageTransition><GraphicPage /></PageTransition>} />
          <Route path="/media" element={<PageTransition><MediaPage /></PageTransition>} />
          <Route path="/full-stack-react" element={<Navigate to="/courses/full-stack-react" replace />} />
          <Route path="/wordpress-mastery" element={<Navigate to="/courses/wordpress-mastery" replace />} />
          <Route path="/laravel-mastery" element={<Navigate to="/courses/laravel-mastery" replace />} />
          <Route path="/graphic-design" element={<Navigate to="/courses/graphic-design" replace />} />
          <Route path="/founder-message" element={<PageTransition><FounderMessage /></PageTransition>} />
          <Route path="/trainers" element={<PageTransition><TraineePage /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/inquiry" element={<PageTransition><InquiryPage /></PageTransition>} />
          <Route path="/register" element={<Navigate to="/inquiry" replace />} />
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
                <Navigate to="/teacher/dashboard" replace />
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
          <Route path="/admin/dashboard" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="dashboard"><PageTransition><AdminDashboard /></PageTransition></PermissionGuard>} />

          {/* Admin Management */}
          <Route path="/admin/students" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="students"><PageTransition><StudentManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/students/:id" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="students"><PageTransition><StudentProfile /></PageTransition></PermissionGuard>} />
          <Route path="/admin/users" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="users"><PageTransition><AdminUserManagement /></PageTransition></PermissionGuard>} />
          <Route path="/admin/users/activity" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="users"><PageTransition><AdminActivityLogsPage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/teachers" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="teachers"><PageTransition><TeacherManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/teachers/:id" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="teachers"><PageTransition><TeacherProfile /></PageTransition></PermissionGuard>} />
          <Route path="/admin/courses" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="courses"><PageTransition><CourseManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/courses/:courseId" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="courses"><PageTransition><CourseDetailPage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/batches" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="courses"><PageTransition><CourseManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/counsellor" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="counsellor"><PageTransition><CounsellorPanel /></PageTransition></PermissionGuard>} />
          <Route path="/admin/counsellor/:view" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="counsellor"><PageTransition><CounsellorPanel /></PageTransition></PermissionGuard>} />
          <Route path="/admin/attendance" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="attendance"><PageTransition><AdminAttendancePage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/certificates" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="results"><PageTransition><CertificateManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/admissions" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="students"><PageTransition><EnrollmentManager /></PageTransition></PermissionGuard>} />
          <Route
            path="/admin/hr"
            element={
              <PermissionGuard allowedRoles={['admin','custom']} permissionKey="hr">
                <PageTransition><AdminHRManagement /></PageTransition>
              </PermissionGuard>
            }
          />

          {/* Admin Communication */}
          <Route path="/admin/announcements" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="announcements"><PageTransition><AdminAnnouncements /></PageTransition></PermissionGuard>} />
          <Route
            path="/admin/complaints"
            element={
              <PermissionGuard allowedRoles={['admin','custom']} permissionKey="complaints">
                <PageTransition><AdminComplaints /></PageTransition>
              </PermissionGuard>
            }
          />

          {/* Admin Finance & Growth */}
          <Route path="/admin/finance" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="finance"><PageTransition><AdminFinance /></PageTransition></PermissionGuard>} />
          <Route path="/admin/finance/fees" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="finance"><PageTransition><AdminFinance /></PageTransition></PermissionGuard>} />
          <Route path="/admin/finance/transactions" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="finance"><PageTransition><AdminFinanceTransactions /></PageTransition></PermissionGuard>} />
          <Route path="/admin/finance/salaries" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="finance"><PageTransition><AdminFinance /></PageTransition></PermissionGuard>} />
          <Route path="/admin/finance/referrals" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="finance"><PageTransition><AdminReferral /></PageTransition></PermissionGuard>} />
          <Route path="/admin/finance/reports" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="finance"><PageTransition><DepartmentPlaceholder title="Revenue Report" icon="📈" /></PageTransition></PermissionGuard>} />
          <Route path="/admin/finance/settings" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="finance"><PageTransition><DepartmentPlaceholder title="Fee Settings" icon="⚙️" /></PageTransition></PermissionGuard>} />
          <Route path="/admin/hr/applications" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="hr"><PageTransition><AdminHRManagement /></PageTransition></PermissionGuard>} />
          <Route path="/admin/hr/jds" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="hr"><PageTransition><AdminHRManagement /></PageTransition></PermissionGuard>} />
          <Route path="/admin/hr/signatures" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="hr"><PageTransition><AdminHRManagement /></PageTransition></PermissionGuard>} />
          <Route path="/admin/hr/files" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="hr"><PageTransition><AdminHRManagement /></PageTransition></PermissionGuard>} />
          <Route path="/admin/hr/teachers" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="hr"><PageTransition><TeacherManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/hr/settings" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="hr"><PageTransition><DepartmentPlaceholder title="HR Settings" icon="⚙️" /></PageTransition></PermissionGuard>} />
          <Route path="/admin/referral" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="referral"><PageTransition><AdminReferral /></PageTransition></PermissionGuard>} />

          {/* Admin System & Settings */}
          <Route path="/admin/reports" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="reports"><PageTransition><AdminReports /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/testimonials" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><TestimonialManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/media" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><MediaLibrary /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/content" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><ContentManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/media-page" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="settings"><PageTransition><MediaPageManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/settings/attendance" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="attendance"><PageTransition><AdminAttendanceSettings /></PageTransition></PermissionGuard>} />
          <Route path="/admin/results" element={<PermissionGuard allowedRoles={['admin','custom']} permissionKey="results"><PageTransition><AdminResults /></PageTransition></PermissionGuard>} />

          {/* Department Canonical Routes */}
          <Route path="/admin/academic" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><DepartmentPlaceholder title="Academic Overview" icon="📚" /></PageTransition></PermissionGuard>} />
          <Route path="/admin/academic/attendance" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminAttendancePage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/academic/tasks" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><DepartmentPlaceholder title="Tasks & Assignments" icon="✅" /></PageTransition></PermissionGuard>} />
          <Route path="/admin/academic/results" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminResults /></PageTransition></PermissionGuard>} />
          <Route path="/admin/academic/announcements" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminAnnouncements /></PageTransition></PermissionGuard>} />
          <Route path="/admin/academic/complaints" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminComplaints /></PageTransition></PermissionGuard>} />
          <Route path="/admin/academic/chats" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><DepartmentPlaceholder title="Group Chats" icon="💬" /></PageTransition></PermissionGuard>} />
          <Route path="/admin/academic/reports" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminReports /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><DepartmentPlaceholder title="Management Overview" icon="🏢" /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/students" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><StudentManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/students/:id" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><StudentProfile /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/teachers" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><TeacherManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/teachers/:id" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><TeacherProfile /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/courses" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><CourseManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/courses/:courseId" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><CourseDetailPage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/referral" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminReferral /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/certificates" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><CertificateManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/blog/*" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><BlogManager /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/media" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><MediaLibrary /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/users" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminUserManagement /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/users/activity" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminActivityLogsPage /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/reports" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><AdminReports /></PageTransition></PermissionGuard>} />
          <Route path="/admin/management/settings" element={<PermissionGuard allowedRoles={['admin']}><PageTransition><ContentManager /></PageTransition></PermissionGuard>} />

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
              <NotificationsProvider>
                <DepartmentProvider>
                  <AppContent />
                </DepartmentProvider>
              </NotificationsProvider>
            </AnnouncementsProvider>
          </GroupChatProvider>
        </ComplaintsProvider>
      </TasksProvider>
    </Router>
  );
}

export default App;
