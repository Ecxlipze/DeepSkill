import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import PrivatePortalNotice from '../../components/next/PrivatePortalNotice';
import { TasksProvider } from '../../src/context/TasksContext';
import { ComplaintsProvider } from '../../src/context/ComplaintsContext';
import { GroupChatProvider } from '../../src/context/GroupChatContext';
import { AnnouncementsProvider } from '../../src/context/AnnouncementsContext';

const AdminLogin = dynamic(() => import('../../src/admin/Login'), { ssr: false });
const AdminDashboard = dynamic(() => import('../../src/admin/Dashboard'), { ssr: false });
const StudentManager = dynamic(() => import('../../src/admin/StudentManager'), { ssr: false });
const StudentProfile = dynamic(() => import('../../src/admin/StudentProfile'), { ssr: false });
const AdminUserManagement = dynamic(() => import('../../src/admin/AdminUserManagement'), { ssr: false });
const AdminActivityLogsPage = dynamic(() => import('../../src/admin/AdminActivityLogsPage'), { ssr: false });
const TeacherManager = dynamic(() => import('../../src/admin/TeacherManager'), { ssr: false });
const TeacherProfile = dynamic(() => import('../../src/admin/TeacherProfile'), { ssr: false });
const CourseManager = dynamic(() => import('../../src/admin/CourseManager'), { ssr: false });
const CourseDetailPage = dynamic(() => import('../../src/admin/CourseDetailPage'), { ssr: false });
const EnrollmentManager = dynamic(() => import('../../src/admin/EnrollmentManager'), { ssr: false });
const AdminAttendancePage = dynamic(() => import('../../src/admin/AdminAttendance'), { ssr: false });
const CertificateManager = dynamic(() => import('../../src/admin/CertificateManager'), { ssr: false });
const AdminHRManagement = dynamic(() => import('../../src/admin/AdminHRManagement'), { ssr: false });
const AdminAnnouncements = dynamic(() => import('../../src/admin/AdminAnnouncements'), { ssr: false });
const AdminComplaints = dynamic(() => import('../../src/admin/AdminComplaints'), { ssr: false });
const AdminFinance = dynamic(() => import('../../src/admin/FinanceManager'), { ssr: false });
const AdminFinanceTransactions = dynamic(() => import('../../src/admin/TransactionHistory'), { ssr: false });
const AdminReferral = dynamic(() => import('../../src/admin/AdminReferral'), { ssr: false });
const AdminResults = dynamic(() => import('../../src/admin/AdminResults'), { ssr: false });
const BlogManager = dynamic(() => import('../../src/admin/BlogManager'), { ssr: false });
const TestimonialManager = dynamic(() => import('../../src/admin/TestimonialManager'), { ssr: false });
const MediaLibrary = dynamic(() => import('../../src/admin/MediaLibrary'), { ssr: false });
const ContentManager = dynamic(() => import('../../src/admin/ContentManager'), { ssr: false });
const MediaPageManager = dynamic(() => import('../../src/admin/MediaPageManager'), { ssr: false });
const AdminReports = dynamic(() => import('../../src/admin/AdminPlaceholders').then((mod) => mod.AdminReports), { ssr: false });

function getAdminPage(path = []) {
  const [section, child] = path;

  if (!section) return <AdminLogin />;
  if (section === 'dashboard') return <AdminDashboard />;
  if (section === 'admissions') return <EnrollmentManager />;
  if (section === 'students') return child ? <StudentProfile /> : <StudentManager />;
  if (section === 'users') return child === 'activity' ? <AdminActivityLogsPage /> : <AdminUserManagement />;
  if (section === 'teachers') return child ? <TeacherProfile /> : <TeacherManager />;
  if (section === 'courses') return child ? <CourseDetailPage /> : <CourseManager />;
  if (section === 'batches') return <CourseManager />;
  if (section === 'attendance') return <AdminAttendancePage />;
  if (section === 'certificates') return <CertificateManager />;
  if (section === 'hr') return <AdminHRManagement />;
  if (section === 'announcements') return <AdminAnnouncements />;
  if (section === 'complaints') return <AdminComplaints />;
  if (section === 'finance') return child === 'transactions' ? <AdminFinanceTransactions /> : <AdminFinance />;
  if (section === 'referral') return <AdminReferral />;
  if (section === 'reports') return <AdminReports />;
  if (section === 'results') return <AdminResults />;
  if (section === 'blog') return <BlogManager />;

  if (section === 'settings') {
    if (child === 'testimonials') return <TestimonialManager />;
    if (child === 'media') return <MediaLibrary />;
    if (child === 'content') return <ContentManager />;
    if (child === 'media-page') return <MediaPageManager />;
  }

  return <PrivatePortalNotice area="Admin" />;
}

function AdminProviders({ children }) {
  return (
    <TasksProvider>
      <ComplaintsProvider>
        <GroupChatProvider>
          <AnnouncementsProvider>
            <Toaster position="top-right" />
            {children}
          </AnnouncementsProvider>
        </GroupChatProvider>
      </ComplaintsProvider>
    </TasksProvider>
  );
}

export default function AdminPortal() {
  const router = useRouter();
  const path = Array.isArray(router.query.path) ? router.query.path : [];

  return <AdminProviders>{getAdminPage(path)}</AdminProviders>;
}
