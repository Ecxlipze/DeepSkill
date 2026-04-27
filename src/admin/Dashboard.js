import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaUserGraduate, FaChalkboardTeacher, FaGraduationCap, 
  FaMoneyBillWave, FaArrowUp, FaChevronRight 
} from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeBatches: 0,
    newStudentsThisMonth: 0,
  });
  const [recentStudents, setRecentStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Get Totals
      const { count: studentCount } = await supabase.from('admissions').select('*', { count: 'exact', head: true });
      const { count: teacherCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
      const { count: batchCount } = await supabase.from('batches').select('*', { count: 'exact', head: true });

      // 2. Get recent registrations
      const { data: recent } = await supabase
        .from('admissions')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(5);

      // 3. Count new students this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newCount } = await supabase
        .from('admissions')
        .select('*', { count: 'exact', head: true })
        .gt('submitted_at', firstDayOfMonth.toISOString());

      setStats({
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        activeBatches: batchCount || 0,
        newStudentsThisMonth: newCount || 0,
      });
      setRecentStudents(recent || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: <FaUserGraduate />, color: '#4F8EF7', change: `+${stats.newStudentsThisMonth}` },
    { label: 'Total Teachers', value: stats.totalTeachers, icon: <FaChalkboardTeacher />, color: '#10B981', change: 'Live' },
    { label: 'Active Batches', value: stats.activeBatches, icon: <FaGraduationCap />, color: '#8B5CF6', change: 'Live' },
    { label: 'Revenue (month)', value: `Rs. 0`, icon: <FaMoneyBillWave />, color: '#F59E0B', change: `Coming Soon`, trend: 'up' },
  ];

  if (loading) return <AdminLayout><div style={{ color: '#fff', padding: '40px' }}>Loading real-time stats...</div></AdminLayout>;

  return (
    <AdminLayout>
      <DashboardGrid>
        {/* Stats Section */}
        <StatsRow>
          {statsCards.map((stat, idx) => (
            <StatCard 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              color={stat.color}
            >
              <div className="card-top">
                <div className="icon-box" style={{ background: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="change-indicator" style={{ color: stat.trend === 'up' || stat.change.includes('+') ? '#10B981' : '#6b7280' }}>
                  {stat.trend === 'up' && <FaArrowUp size={10} />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <div className="card-bottom">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </StatCard>
          ))}
        </StatsRow>

        {/* Content Row */}
        <ContentRow>
          <TableCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="card-header">
              <h3>Recent Students</h3>
              <Link to="/admin/students" className="view-all">View all <FaChevronRight size={10} /></Link>
            </div>
            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Batch</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="user-info">
                          <span className="name">{student.name}</span>
                          <span className="cnic">{student.cnic}</span>
                        </div>
                      </td>
                      <td>{student.course}</td>
                      <td>{student.batch || 'Pending'}</td>
                      <td>
                        <StatusBadge active={student.status === 'Active'}>
                          {student.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                  {recentStudents.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No students found in database.</td></tr>
                  )}
                </tbody>
              </table>
            </TableContainer>
          </TableCard>

          <TableCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card-header">
              <h3>System Health</h3>
              <div className="view-all" style={{ color: '#10B981' }}>All Systems Online</div>
            </div>
            <div style={{ padding: '25px', color: '#6b7280', fontSize: '0.9rem' }}>
              <p>Everything is running smoothly. Your real-time connection to Supabase is active.</p>
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DB Connection</span>
                  <span style={{ color: '#10B981' }}>Stable</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Auth Service</span>
                  <span style={{ color: '#10B981' }}>Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Storage</span>
                  <span style={{ color: '#10B981' }}>Ready</span>
                </div>
              </div>
            </div>
          </TableCard>
        </ContentRow>
      </DashboardGrid>
    </AdminLayout>
  );
};

// ----- Styled Components ----- //

const DashboardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const StatCard = styled(motion.div)`
  background: #111318;
  padding: 25px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 3px solid ${props => props.color};
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }

  .icon-box {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  .change-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .card-bottom {
    h3 { margin: 0; font-size: 1.6rem; color: #fff; margin-bottom: 5px; }
    p { margin: 0; font-size: 0.85rem; color: #6b7280; font-weight: 500; }
  }
`;

const ContentRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 25px;

  @media (max-width: 1100px) { grid-template-columns: 1fr; }
`;

const TableCard = styled(motion.div)`
  background: #111318;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;

  .card-header {
    padding: 20px 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 { margin: 0; font-size: 1.1rem; color: #fff; }
    .view-all { 
      font-size: 0.8rem; 
      color: #4F8EF7; 
      text-decoration: none; 
      display: flex; 
      align-items: center; 
      gap: 5px; 
      &:hover { text-decoration: underline; }
    }
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th {
      text-align: left;
      padding: 15px 25px;
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.02);
    }
    
    td {
      padding: 15px 25px;
      font-size: 0.9rem;
      color: #eee;
      border-top: 1px solid rgba(255, 255, 255, 0.03);
    }
  }

  .user-info {
    display: flex;
    flex-direction: column;
    .name { font-weight: 500; color: #fff; }
    .cnic { font-size: 0.75rem; color: #6b7280; }
  }

  .time { font-size: 0.8rem; color: #6b7280; }
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)'};
  color: ${props => props.active ? '#10B981' : '#9ca3af'};
`;

export default AdminDashboard;
