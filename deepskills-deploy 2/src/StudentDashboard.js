import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { useTasks } from './context/TasksContext';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import {
  FaHome, FaTasks, FaChartLine, FaCertificate,
  FaExclamationCircle, FaUserPlus, FaComments,
  FaWallet, FaUserFriends, FaGraduationCap, FaCheckCircle,
  FaBullhorn
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

const StatusBadge = styled.span`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  background: ${props => props.$graduated ? 'rgba(139, 92, 246, 0.14)' : 'rgba(16, 185, 129, 0.12)'};
  color: ${props => props.$graduated ? '#c4b5fd' : '#34d399'};
  border: 1px solid ${props => props.$graduated ? 'rgba(139, 92, 246, 0.3)' : 'rgba(16, 185, 129, 0.25)'};
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;

  @media (max-width: 768px) {
    align-self: center;
  }
`;

const AlumniPanel = styled(Card)`
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  align-items: center;
  background:
    linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(17, 17, 17, 0.94)),
    #111;
  border-color: rgba(139, 92, 246, 0.24);

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const AlumniTitle = styled.h3`
  margin: 0 0 8px;
  color: #fff;
  font-size: 1.35rem;
`;

const AlumniText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.6;
`;

const AlumniActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 800px) {
    justify-content: flex-start;
  }
`;

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border-radius: 8px;
  background: ${props => props.$primary ? '#7B1F2E' : 'rgba(255,255,255,0.06)'};
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.88rem;
  border: 1px solid ${props => props.$primary ? 'rgba(123,31,46,0.4)' : 'rgba(255,255,255,0.08)'};

  &:hover {
    background: ${props => props.$primary ? '#96283a' : 'rgba(255,255,255,0.1)'};
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
  grid-template-columns: 1fr;
  gap: 30px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
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

// ----- Dashboard Component ----- //
const StudentDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const [studentData, setStudentData] = useState(null);

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
            .select('time_shift, completed_at, status')
            .eq('batch_name', admission.batch)
            .eq('course', admission.course)
            .single();
          batchInfo = bData;
        }

        const { data: attendance } = await supabase
          .from('attendance')
          .select('status')
          .eq('student_id', admission.id);

        const totalClasses = attendance?.length || 0;
        const attended = attendance?.filter(r => r.status === 'present' || r.status === 'late').length || 0;

        setStudentData({
          ...admission,
          timing: batchInfo?.time_shift || admission.batch_timing || "Timing not assigned",
          batchCompletedAt: batchInfo?.completed_at,
          totalClasses,
          attended
        });
      } catch (err) {
        console.error("Error syncing student dashboard:", err);
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
    status: studentData?.status || user?.status || 'Active',
    graduatedAt: studentData?.graduated_at || studentData?.batchCompletedAt,
    totalClasses: studentData?.totalClasses || 0,
    attended: studentData?.attended || 0,
  };
  const isGraduated = student.status === 'Graduated';

  const myTasks = tasks.filter(t => t.course === student.course && t.batch === student.batch);
  const submittedTasks = myTasks.filter(task => task.submissions?.some(sub => sub.cnic === student.cnic));
  const assignmentCompletion = myTasks.length > 0 ? Math.round((submittedTasks.length / myTasks.length) * 100) : 0;

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const attendancePercent = student.totalClasses > 0 ? Number(((student.attended / student.totalClasses) * 100).toFixed(1)) : 0;
  const courseCompletion = myTasks.length > 0 || student.totalClasses > 0
    ? Math.round((assignmentCompletion + attendancePercent) / 2)
    : 0;

  const displayDate = student.graduatedAt
    ? new Date(student.graduatedAt).toLocaleDateString()
    : null;

  return (
    <DashboardLayout>
      <Container>

        {/* 1. Header Card */}
        <HeaderCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Avatar>{getInitials(student.name)}</Avatar>
          <InfoBlock>
            <StatusBadge $graduated={isGraduated}>
              {isGraduated ? <FaGraduationCap /> : <FaCheckCircle />}
              {isGraduated ? 'Graduated' : 'Active Student'}
            </StatusBadge>
            <StudentName>{student.name}</StudentName>
            <DetailRow>
              <span><strong>CNIC:</strong> {student.cnic}</span>
              <span><strong>Course:</strong> {student.course}</span>
              <span><strong>Batch:</strong> {student.batch} — {student.timing}</span>
              {isGraduated && displayDate && <span><strong>Graduated:</strong> {displayDate}</span>}
            </DetailRow>
          </InfoBlock>
        </HeaderCard>

        {isGraduated && (
          <AlumniPanel
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <div>
              <AlumniTitle>Course completed</AlumniTitle>
              <AlumniText>
                Your batch is closed now, so live classroom tools are hidden. You can still view your progress,
                results, finance history, certificate, referrals, and start a new enrollment.
              </AlumniText>
            </div>
            <AlumniActions>
              <ActionLink to="/student/certificate" $primary><FaCertificate /> Certificate</ActionLink>
              <ActionLink to="/student/new-enrollment"><FaUserPlus /> New Enrollment</ActionLink>
            </AlumniActions>
          </AlumniPanel>
        )}

        {/* 2. Stats Row */}
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatLabel>{isGraduated ? 'Final Attendance' : 'Total Attendance'}</StatLabel>
            <StatValue>{student.attended} / {student.totalClasses}</StatValue>
            <StatSub>days attended</StatSub>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatLabel>{isGraduated ? 'Course Completed' : 'Course Enrolled'}</StatLabel>
            <StatValue style={{ fontSize: '1.3rem', lineHeight: '1.2' }}>{student.course}</StatValue>
            <StatSub>{isGraduated ? 'Alumni record' : 'Active course'}</StatSub>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatLabel>{isGraduated ? 'Completed Batch' : 'Batch / Timing'}</StatLabel>
            <StatValue style={{ fontSize: '1.8rem' }}>{student.batch || 'Batch 12'}</StatValue>
            <StatSub>{isGraduated ? (displayDate || 'Completed') : (student.timing.split('—')[1]?.trim() || '9:00 AM – 12:00 PM')}</StatSub>
          </StatCard>
        </StatsGrid>

        <BottomGrid>

          {/* Right Column - Progress Circles */}
          <Card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <SectionTitle>{isGraduated ? 'Final Summary' : 'My Progress'}</SectionTitle>
            <RingsContainer>
              <RingRow>
                <RingLabel>Attendance</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={attendancePercent} color="#4da6ff" />
                <RingValue>{attendancePercent}%</RingValue>
              </RingRow>

              <RingRow>
                <RingLabel>Course Completion</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={courseCompletion} color="#00e676" />
                <RingValue>{courseCompletion}%</RingValue>
              </RingRow>

              <RingRow>
                <RingLabel>Assignments</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={assignmentCompletion} color="#ffab00" />
                <RingValue>{assignmentCompletion}%</RingValue>
              </RingRow>
            </RingsContainer>
          </Card>

        </BottomGrid>

      </Container>
    </DashboardLayout>
  );
};

export default StudentDashboard;
