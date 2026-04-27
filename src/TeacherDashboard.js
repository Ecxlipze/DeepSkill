import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import { 
  FaHome, FaTasks, FaExclamationCircle, 
  FaWallet, FaUserFriends
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
  background: linear-gradient(135deg, #1f427b, #2d55b3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(31, 66, 123, 0.4);
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TeacherName = styled.h2`
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
  color: #4da6ff;
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
      case 'Excellent': return 'background: rgba(46, 125, 50, 0.15); color: #4caf50; border: 1px solid rgba(46, 125, 50, 0.3);';
      case 'Good': return 'background: rgba(77, 166, 255, 0.15); color: #4da6ff; border: 1px solid rgba(77, 166, 255, 0.3);';
      case 'Average': return 'background: rgba(255, 152, 0, 0.15); color: #ff9800; border: 1px solid rgba(255, 152, 0, 0.3);';
      default: return 'background: #333; color: #fff;';
    }
  }}
`;

const ViewAllLink = styled.div`
  text-align: right;
  margin-top: 15px;
  a {
    color: #4da6ff;
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

const mockTeacherData = {
  course: "Web Development Bootcamp",
  batch: "Batch 12",
  timing: "Morning — 9:00 AM to 12:00 PM",
  totalStudents: 45,
  classesConducted: 14,
  totalClasses: 50,
  classAverage: 82,
  assignmentsGraded: 95,
  courseProgress: 28,
};

const recentClasses = [
  { date: "2025-04-16", topic: "React State Management", attendance: "92%", status: "Excellent" },
  { date: "2025-04-15", topic: "React Components & Props", attendance: "88%", status: "Good" },
  { date: "2025-04-14", topic: "Intro to React", attendance: "95%", status: "Excellent" },
  { date: "2025-04-10", topic: "Advanced JavaScript", attendance: "85%", status: "Good" },
  { date: "2025-04-09", topic: "DOM Manipulation", attendance: "78%", status: "Average" },
];

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedBatches: [],
    totalStudents: 0,
    mainCourse: "---",
    mainBatch: "---",
    mainTiming: "---"
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchTeacherStats = async () => {
      if (!user?.cnic) return;

      try {
        // 1. Get Teacher ID first
        const { data: teacher, error: tError } = await supabase
          .from('teachers')
          .select('id')
          .eq('cnic', user.cnic)
          .single();
        
        if (tError) throw tError;

        // 2. Get Assigned Batches
        const { data: assignments, error: aError } = await supabase
          .from('teacher_batches')
          .select(`
            batch_id,
            batches (
              id,
              batch_name,
              course,
              time_shift
            )
          `)
          .eq('teacher_id', teacher.id);

        if (aError) throw aError;

        const batches = assignments.map(a => a.batches).filter(Boolean);
        
        // 3. Count Students in these batches
        let studentCount = 0;
        if (batches.length > 0) {
          const batchNames = batches.map(b => b.batch_name);
          const { count, error: cError } = await supabase
            .from('admissions')
            .select('*', { count: 'exact', head: true })
            .in('batch', batchNames);
          
          if (!cError) studentCount = count;
        }

        const mainBatch = batches[0];

        setStats({
          assignedBatches: batches,
          totalStudents: studentCount,
          mainCourse: mainBatch?.course || "None",
          mainBatch: mainBatch?.batch_name || "None",
          mainTiming: mainBatch?.time_shift || "---"
        });

      } catch (err) {
        console.error("Error fetching teacher stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchTeacherStats();
  }, [user]);

  const teacher = {
    name: user?.name || "Loading...",
    cnic: user?.cnic || "---",
    course: stats.mainCourse,
    batch: stats.mainBatch,
    timing: stats.mainTiming,
    totalStudents: stats.totalStudents,
    classesConducted: 0,
    totalClasses: 50,
    classAverage: 0,
    assignmentsGraded: 0,
    courseProgress: 0,
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const navItems = [
    { label: 'Home', path: '/teacher/dashboard', icon: <FaHome /> },
    { 
      label: 'Tasks', 
      icon: <FaTasks />, 
      subItems: [
        { label: 'Assign Task', path: '/teacher/tasks/assign' },
        { label: 'View Tasks', path: '/teacher/tasks/view' }
      ]
    },
    { label: 'Complaints', path: '/teacher/complaints', icon: <FaExclamationCircle /> },
    { label: 'Finance', path: '/teacher/finance', icon: <FaWallet /> },
    { label: 'Referral Program', path: '/teacher/referral', icon: <FaUserFriends /> }
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
          <Avatar>{getInitials(teacher.name)}</Avatar>
          <InfoBlock>
            <TeacherName>{teacher.name}</TeacherName>
            <DetailRow>
              <span><strong>CNIC:</strong> {teacher.cnic}</span>
              <span><strong>Course:</strong> {teacher.course}</span>
              <span><strong>Batch:</strong> {teacher.batch} — {teacher.timing}</span>
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
            <StatLabel>Total Students</StatLabel>
            <StatValue>{teacher.totalStudents}</StatValue>
            <StatSub>currently enrolled</StatSub>
          </StatCard>
          
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatLabel>Classes Conducted</StatLabel>
            <StatValue style={{ fontSize: '2rem', lineHeight: '1.2' }}>{teacher.classesConducted} / {teacher.totalClasses}</StatValue>
            <StatSub>sessions completed</StatSub>
          </StatCard>
          
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatLabel>Class Average</StatLabel>
            <StatValue style={{ fontSize: '2.5rem' }}>{teacher.classAverage}%</StatValue>
            <StatSub>student performance</StatSub>
          </StatCard>
        </StatsGrid>

        {/* 3. Bottom Two-Column Layout */}
        <BottomGrid>
          
          {/* Left Column - Recent Classes Table */}
          <Card
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SectionTitle>Recent Classes Conducted</SectionTitle>
            <TableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Topic Covered</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClasses.map((record, index) => (
                    <tr key={index}>
                      <td>{record.date}</td>
                      <td>{record.topic}</td>
                      <td>
                        <Badge status={record.status}>{record.attendance}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableWrapper>
            <ViewAllLink>
              <a href="#view-all">View Full Log</a>
            </ViewAllLink>
          </Card>

          {/* Right Column - Performance Overview */}
          <Card
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <SectionTitle>Course Overview</SectionTitle>
            <RingsContainer>
              <RingRow>
                <RingLabel>Course Progress</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={teacher.courseProgress} color="#4da6ff" />
                <RingValue>{teacher.courseProgress}%</RingValue>
              </RingRow>
              
              <RingRow>
                <RingLabel>Assignments Graded</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={teacher.assignmentsGraded} color="#00e676" />
                <RingValue>{teacher.assignmentsGraded}%</RingValue>
              </RingRow>
              
              <RingRow>
                <RingLabel>Overall Attendance</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={88} color="#ffab00" />
                <RingValue>88%</RingValue>
              </RingRow>
            </RingsContainer>
          </Card>

        </BottomGrid>

      </Container>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
