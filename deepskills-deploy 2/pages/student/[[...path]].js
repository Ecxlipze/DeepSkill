import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import PrivatePortalNotice from '../../components/next/PrivatePortalNotice';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { TasksProvider } from '../../src/context/TasksContext';
import { ComplaintsProvider } from '../../src/context/ComplaintsContext';
import { GroupChatProvider } from '../../src/context/GroupChatContext';
import { AnnouncementsProvider } from '../../src/context/AnnouncementsContext';

const StudentDashboard = dynamic(() => import('../../src/StudentDashboard'), { ssr: false });
const StudentTasks = dynamic(() => import('../../src/student/StudentTasks'), { ssr: false });
const StudentProgress = dynamic(() => import('../../src/student/StudentProgress'), { ssr: false });
const StudentFinance = dynamic(() => import('../../src/student/StudentFinance'), { ssr: false });
const StudentCertificate = dynamic(() => import('../../src/student/StudentCertificate'), { ssr: false });
const StudentComplaints = dynamic(() => import('../../src/student/StudentComplaints'), { ssr: false });
const StudentAttendance = dynamic(() => import('../../src/student/StudentAttendance'), { ssr: false });
const StudentResults = dynamic(() => import('../../src/student/StudentResults'), { ssr: false });
const NewEnrollment = dynamic(() => import('../../src/student/NewEnrollment'), { ssr: false });
const StudentGroupChat = dynamic(() => import('../../src/student/StudentGroupChat'), { ssr: false });
const StudentAnnouncements = dynamic(() => import('../../src/student/StudentAnnouncements'), { ssr: false });
const ReferralPage = dynamic(() => import('../../src/components/ReferralPage'), { ssr: false });

function getStudentPage(path = []) {
  const [section] = path;

  if (!section || section === 'dashboard') return <StudentDashboard />;
  if (section === 'tasks') return <StudentTasks />;
  if (section === 'progress') return <StudentProgress />;
  if (section === 'finance') return <StudentFinance />;
  if (section === 'certificate') return <StudentCertificate />;
  if (section === 'complaints') return <StudentComplaints />;
  if (section === 'attendance') return <StudentAttendance />;
  if (section === 'results') return <StudentResults />;
  if (section === 'new-enrollment') return <NewEnrollment />;
  if (section === 'group-chat') return <StudentGroupChat />;
  if (section === 'announcements') return <StudentAnnouncements />;
  if (section === 'referral') return <ReferralPage />;

  return <PrivatePortalNotice area="Student" />;
}

function StudentProviders({ children }) {
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

export default function StudentPortal() {
  const router = useRouter();
  const path = Array.isArray(router.query.path) ? router.query.path : [];

  return (
    <StudentProviders>
      <ProtectedRoute allowedRoles={['student']}>
        {getStudentPage(path)}
      </ProtectedRoute>
    </StudentProviders>
  );
}
