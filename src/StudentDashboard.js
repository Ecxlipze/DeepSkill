import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import {
  FaHome, FaTasks, FaChartLine, FaCertificate,
  FaExclamationCircle, FaUserPlus, FaComments,
  FaWallet, FaUserFriends, FaGraduationCap
} from 'react-icons/fa';

// ----- Styled Components ----- //

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: #111;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

// 1. Header Card
const HeaderCard = styled(Card)`
  display: flex;
  align-items: center;
  gap: 25px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7B1F2E, #b32d43);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(123, 31, 46, 0.4);
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StudentName = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  color: #fff;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    
    strong {
      color: #ccc;
      font-weight: 600;
    }
  }
`;

// 2. Stats Row
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
  padding: 30px 20px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
`;

const StatSub = styled.div`
  color: #7B1F2E;
  font-size: 0.85rem;
  font-weight: 500;
`;

// 3. Bottom Two-Column Layout
const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
`;

// Table Styles
const TableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  
  th {
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
    font-size: 0.9rem;
  }
  
  td {
    color: #ccc;
    font-size: 0.95rem;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${({ status }) => {
    switch (status) {
      case 'Present': return 'background: rgba(46, 125, 50, 0.15); color: #4caf50; border: 1px solid rgba(46, 125, 50, 0.3);';
      case 'Absent': return 'background: rgba(211, 47, 47, 0.15); color: #f44336; border: 1px solid rgba(211, 47, 47, 0.3);';
      case 'Late': return 'background: rgba(255, 152, 0, 0.15); color: #ff9800; border: 1px solid rgba(255, 152, 0, 0.3);';
      default: return 'background: #333; color: #fff;';
    }
  }}
`;

const ViewAllLink = styled.div`
  text-align: right;
  margin-top: 15px;
  a {
    color: #7B1F2E;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

// Progress Rings
const RingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const RingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RingLabel = styled.div`
  color: #ccc;
  font-size: 0.95rem;
  flex: 1;
`;

const RingValue = styled.div`
  color: #fff;
  font-weight: bold;
  font-size: 1.1rem;
  width: 50px;
  text-align: right;
`;

// SVG Circle Component
const ProgressRing = ({ radius, stroke, progress, color }) => {
  const [offset, setOffset] = useState(0);
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    // Small timeout to allow the transition to happen on mount
    const timer = setTimeout(() => {
      setOffset(strokeDashoffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress, circumference]);

  return (
    <div style={{ position: 'relative', width: radius * 2, height: radius * 2, margin: '0 15px' }}>
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          stroke="rgba(255,255,255,0.1)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
    </div>
  );
};

// ----- Mock Data ----- //

const mockStudentData = {
  course: "Web Development Bootcamp",
  batch: "Batch 12",
  timing: "Morning — 9:00 AM to 12:00 PM",
  totalClasses: 50,
  attended: 43,
  coursesEnrolled: 2,
  courseCompletion: 62,
  assignmentCompletion: 74,
};

const attendanceRecords = [
  { date: "2025-04-01", day: "Tuesday", status: "Present" },
  { date: "2025-04-02", day: "Wednesday", status: "Present" },
  { date: "2025-04-03", day: "Thursday", status: "Absent" },
  { date: "2025-04-07", day: "Monday", status: "Late" },
  { date: "2025-04-08", day: "Tuesday", status: "Present" },
  { date: "2025-04-09", day: "Wednesday", status: "Present" },
  { date: "2025-04-10", day: "Thursday", status: "Present" },
  { date: "2025-04-14", day: "Monday", status: "Absent" },
  { date: "2025-04-15", day: "Tuesday", status: "Present" },
  { date: "2025-04-16", day: "Wednesday", status: "Late" },
];
const StudentDashboard = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchLiveStats = async () => {
      if (!user?.cnic) return;
      
      try {
        // 1. Fetch latest admission details
        const { data: admission, error: admError } = await supabase
          .from('admissions')
          .select('*')
          .eq('cnic', user.cnic)
          .single();

        if (admError) throw admError;

        // 2. Fetch batch timing
        let batchInfo = null;
        if (admission.batch) {
          const { data: bData } = await supabase
            .from('batches')
            .select('time_shift')
            .eq('batch_name', admission.batch)
            .eq('course', admission.course)
            .single();
          batchInfo = bData;
        }

        setStudentData({
          ...admission,
          timing: batchInfo?.time_shift || "Timing not assigned",
          totalClasses: 50, // Placeholder for now
          attended: 0,      // Placeholder for now
          courseCompletion: 0,
          assignmentCompletion: 0
        });
      } catch (err) {
        console.error("Error syncing student dashboard:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchLiveStats();
  }, [user]);

  const student = {
    name: studentData?.name || user?.name || "Loading...",
    cnic: studentData?.cnic || user?.cnic || "---",
    course: studentData?.course || "No Course Assigned",
    batch: studentData?.batch || "No Batch Assigned",
    timing: studentData?.timing || "---",
    totalClasses: studentData?.totalClasses || 50,
    attended: studentData?.attended || 0,
    courseCompletion: studentData?.courseCompletion || 0,
    assignmentCompletion: studentData?.assignmentCompletion || 0,
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const attendancePercent = ((student.attended / student.totalClasses) * 100).toFixed(1);

  const navItems = [
    { label: 'Home', path: '/student/dashboard', icon: <FaHome /> },
    { label: 'Tasks', path: '/student/tasks', icon: <FaTasks /> },
    { label: 'Progress', path: '/student/progress', icon: <FaChartLine /> },
    { label: 'Certificate', path: '/student/certificate', icon: <FaCertificate /> },
    { label: 'Complaints', path: '/student/complaints', icon: <FaExclamationCircle /> },
    { label: 'Results (Mid Term)', path: '/student/results/mid', icon: <FaGraduationCap /> },
    { label: 'Results (Final Term)', path: '/student/results/final', icon: <FaGraduationCap /> },
    { label: 'New Enrollment', path: '/student/enrollment', icon: <FaUserPlus /> },
    { label: 'Group Chat', path: '/student/chat', icon: <FaComments /> },
    { label: 'Finance', path: '/student/finance', icon: <FaWallet /> },
    { label: 'Referral Program', path: '/student/referral', icon: <FaUserFriends /> }
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <Container>

        {/* 1. Header Card */}
        <HeaderCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Avatar>{getInitials(student.name)}</Avatar>
          <InfoBlock>
            <StudentName>{student.name}</StudentName>
            <DetailRow>
              <span><strong>CNIC:</strong> {student.cnic}</span>
              <span><strong>Course:</strong> {student.course}</span>
              <span><strong>Batch:</strong> {student.batch} — {student.timing}</span>
            </DetailRow>
          </InfoBlock>
        </HeaderCard>

        {/* 2. Stats Row */}
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatLabel>Total Attendance</StatLabel>
            <StatValue>{student.attended} / {student.totalClasses}</StatValue>
            <StatSub>days attended</StatSub>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatLabel>Course Enrolled</StatLabel>
            <StatValue style={{ fontSize: '1.3rem', lineHeight: '1.2' }}>{student.course}</StatValue>
            <StatSub>Active course</StatSub>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatLabel>Batch / Timing</StatLabel>
            <StatValue style={{ fontSize: '1.8rem' }}>{student.batch || 'Batch 12'}</StatValue>
            <StatSub>{student.timing.split('—')[1]?.trim() || '9:00 AM – 12:00 PM'}</StatSub>
          </StatCard>
        </StatsGrid>

        {/* 3. Bottom Two-Column Layout */}
        <BottomGrid>

          {/* Left Column - Attendance Table */}
          <Card
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SectionTitle>Recent Attendance</SectionTitle>
            <TableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.day}</td>
                      <td>
                        <Badge status={record.status}>{record.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableWrapper>
            <ViewAllLink>
              <a href="#view-all">View All</a>
            </ViewAllLink>
          </Card>

          {/* Right Column - Progress Circles */}
          <Card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <SectionTitle>My Progress</SectionTitle>
            <RingsContainer>
              <RingRow>
                <RingLabel>Attendance</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={attendancePercent} color="#4da6ff" />
                <RingValue>{attendancePercent}%</RingValue>
              </RingRow>

              <RingRow>
                <RingLabel>Course Completion</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={student.courseCompletion} color="#00e676" />
                <RingValue>{student.courseCompletion}%</RingValue>
              </RingRow>

              <RingRow>
                <RingLabel>Assignments</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={student.assignmentCompletion} color="#ffab00" />
                <RingValue>{student.assignmentCompletion}%</RingValue>
              </RingRow>
            </RingsContainer>
          </Card>

        </BottomGrid>

      </Container>
    </DashboardLayout>
  );
};

export default StudentDashboard;
