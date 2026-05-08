import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import { getAssignedTeacherBatches, getTeacherByCnic } from './utils/teacherUtils';

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
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  align-items: start;
  gap: 28px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const Avatar = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1f427b, #2d55b3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 4px 15px rgba(31, 66, 123, 0.4);

  @media (max-width: 768px) {
    width: 76px;
    height: 76px;
    font-size: 2rem;
  }
`;

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  width: 100%;
`;

const TeacherName = styled.h2`
  margin: 0;
  font-size: clamp(1.45rem, 2vw, 1.8rem);
  color: #fff;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }

  span {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    overflow-wrap: anywhere;
    
    strong {
      color: #ccc;
      font-weight: 600;
    }
  }
`;

const AssignmentHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .label {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
`;

const ScopeList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 8px;
`;

const ScopeOption = styled.button`
  width: 100%;
  background: ${props => props.$active ? 'rgba(77, 166, 255, 0.14)' : 'rgba(255, 255, 255, 0.035)'};
  border: 1px solid ${props => props.$active ? 'rgba(77, 166, 255, 0.45)' : 'rgba(255, 255, 255, 0.08)'};
  border-radius: 10px;
  color: ${props => props.$active ? '#fff' : 'rgba(255, 255, 255, 0.72)'};
  cursor: pointer;
  font-family: inherit;
  padding: 12px;
  text-align: left;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;

  &:hover {
    background: rgba(77, 166, 255, 0.1);
    border-color: #4da6ff;
  }

  &:disabled {
    cursor: default;
    opacity: 0.65;
  }

  &:disabled:hover {
    background: rgba(255, 255, 255, 0.035);
    border-color: rgba(255, 255, 255, 0.08);
  }

  &:focus-visible {
    outline: 2px solid rgba(77, 166, 255, 0.55);
    outline-offset: 2px;
  }

  .course {
    display: block;
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 4px;
    overflow-wrap: anywhere;
  }

  .batch {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
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
const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [stats, setStats] = useState({
    assignedBatches: [],
    totalStudents: 0,
    classesConducted: 0,
    classAverage: 0,
    tasksAssigned: 0,
    assignmentsGraded: 0,
    overallAttendance: 0
  });

  useEffect(() => {
    const fetchTeacherStats = async () => {
      if (!user?.cnic) return;

      try {
        const teacher = await getTeacherByCnic(user.cnic);
        const batches = await getAssignedTeacherBatches(teacher.id);
        const activeBatch = batches.find((batch) => batch.id === selectedBatchId) || batches[0];
        const batchNames = activeBatch?.batch_name ? [activeBatch.batch_name] : [];

        let studentCount = 0;
        let classAverage = 0;
        let classesConducted = 0;
        let tasksAssigned = 0;
        let assignmentsGraded = 0;
        let overallAttendance = 0;

        if (batchNames.length > 0) {
          const { count, error: cError } = await supabase
            .from('admissions')
            .select('*', { count: 'exact', head: true })
            .in('batch', batchNames);
          
          if (!cError) studentCount = count;

          const { data: attendanceData } = await supabase
            .from('attendance')
            .select('date, status, batch_name')
            .in('batch_name', batchNames);

          const uniqueClassDates = new Set();
          let presentCount = 0;

          attendanceData?.forEach((row) => {
            uniqueClassDates.add(`${row.batch_name}-${row.date}`);
            if (row.status === 'present' || row.status === 'late') presentCount += 1;
          });

          classesConducted = uniqueClassDates.size;
          overallAttendance = attendanceData?.length
            ? Math.round((presentCount / attendanceData.length) * 100)
            : 0;
          classAverage = overallAttendance;

          const { data: taskData } = await supabase
            .from('tasks')
            .select(`
              id,
              batch,
              task_submissions(status, marks_obtained)
            `)
            .in('batch', batchNames)
            .eq('assigned_by', user.name);

          tasksAssigned = taskData?.length || 0;

          const submissions = taskData?.flatMap(task => task.task_submissions || []) || [];
          const gradedCount = submissions.filter(sub => sub.status === 'Graded' || sub.marks_obtained !== null).length;
          assignmentsGraded = submissions.length > 0 ? Math.round((gradedCount / submissions.length) * 100) : 0;
        }

        setStats({
          assignedBatches: batches,
          selectedBatch: activeBatch || null,
          totalStudents: studentCount,
          classesConducted,
          classAverage,
          tasksAssigned,
          assignmentsGraded,
          overallAttendance
        });

      } catch (err) {
        console.error("Error fetching teacher stats:", err);
      }
    };

    fetchTeacherStats();
  }, [user, selectedBatchId]);

  useEffect(() => {
    if (selectedBatchId || stats.assignedBatches.length === 0) return;
    setSelectedBatchId(stats.assignedBatches[0].id);
  }, [selectedBatchId, stats.assignedBatches]);

  const teacher = {
    name: user?.name || "Loading...",
    cnic: user?.cnic || "---",
    totalStudents: stats.totalStudents,
    classesConducted: stats.classesConducted,
    totalClasses: stats.classesConducted,
    classAverage: stats.classAverage,
    assignmentsGraded: 0,
    courseProgress: stats.overallAttendance,
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const selectedBatch = stats.selectedBatch;
  const selectedTiming = selectedBatch?.time_shift || selectedBatch?.batch_timing;

  return (
    <DashboardLayout>
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
            </DetailRow>
            <AssignmentHeader>
              <div className="label">Course & Batch Scope</div>
              {stats.assignedBatches.length > 0 && (
                <ScopeList aria-label="Select dashboard batch">
                  {stats.assignedBatches.map((batch) => {
                    const timing = batch.time_shift || batch.batch_timing;
                    return (
                      <ScopeOption
                        key={batch.id}
                        type="button"
                        $active={selectedBatch?.id === batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                      >
                        <span className="course">{batch.course || 'General Course'}</span>
                        <span className="batch">
                          {batch.batch_name || 'Unnamed batch'}{timing ? ` - ${timing}` : ''}
                        </span>
                      </ScopeOption>
                    );
                  })}
                </ScopeList>
              )}
              {stats.assignedBatches.length === 0 && (
                <ScopeOption type="button" disabled>
                  <span className="course">No assignments</span>
                  <span className="batch">No course or batch assigned yet.</span>
                </ScopeOption>
              )}
            </AssignmentHeader>
          </InfoBlock>
        </HeaderCard>

        {/* 2. Stats Row */}
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatLabel>Active Batch</StatLabel>
            <StatValue>{stats.assignedBatches.length}</StatValue>
            <StatSub>{selectedBatch?.batch_name || 'none selected'}</StatSub>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <StatLabel>Total Students</StatLabel>
            <StatValue>{teacher.totalStudents}</StatValue>
            <StatSub>{selectedBatch?.course || 'selected course'}</StatSub>
          </StatCard>
          
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <StatLabel>Classes Conducted</StatLabel>
            <StatValue style={{ fontSize: '2rem', lineHeight: '1.2' }}>{teacher.classesConducted}</StatValue>
            <StatSub>{selectedTiming || 'timing not set'}</StatSub>
          </StatCard>
          
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <StatLabel>Class Average</StatLabel>
            <StatValue style={{ fontSize: '2.5rem' }}>{teacher.classAverage}%</StatValue>
            <StatSub>student performance</StatSub>
          </StatCard>
        </StatsGrid>

        {/* 3. Bottom Two-Column Layout */}
        <BottomGrid>

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
                <ProgressRing radius={25} stroke={4} progress={stats.assignmentsGraded} color="#00e676" />
                <RingValue>{stats.assignmentsGraded}%</RingValue>
              </RingRow>
              
              <RingRow>
                <RingLabel>Overall Attendance</RingLabel>
                <ProgressRing radius={25} stroke={4} progress={stats.overallAttendance} color="#ffab00" />
                <RingValue>{stats.overallAttendance}%</RingValue>
              </RingRow>
            </RingsContainer>
          </Card>

        </BottomGrid>

      </Container>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
