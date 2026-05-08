import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaDownload, FaCalendarAlt, FaChartLine,
  FaExclamationCircle, FaCheckCircle, FaSearch, FaChevronRight
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';
import { Skeleton, SkeletonCard } from '../components/Skeleton';

const Container = styled.div`
  padding: 20px 0;
  color: #fff;
`;

const Header = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 30px;
  h1 { font-size: 2rem; font-weight: 800; margin-bottom: 5px; }
  p { color: #888; font-size: 1rem; }
`;

const ExportBtn = styled.button`
  padding: 12px 24px; border-radius: 10px; background: rgba(55, 138, 221, 0.1);
  color: #378ADD; border: 1px solid rgba(55, 138, 221, 0.2);
  font-weight: 700; font-size: 0.9rem; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  &:hover { background: rgba(55, 138, 221, 0.2); transform: translateY(-2px); }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: #111318;
  padding: 25px; border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex; flex-direction: column; gap: 10px;

  .label { color: #666; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
  .value { font-size: 2.2rem; font-weight: 800; color: #fff; }
  .trend { font-size: 0.8rem; display: flex; align-items: center; gap: 5px; }
`;

const FilterCard = styled.div`
  background: #111318; padding: 25px; border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05); margin-bottom: 30px;
`;

const FilterGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  label { font-size: 0.8rem; color: #555; text-transform: uppercase; font-weight: 700; }
  select, input {
    background: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px; padding: 12px; color: #fff; outline: none;
    &:focus { border-color: #378ADD; }
  }
`;

const TabContainer = styled.div`
  background: #111318; border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05); overflow: hidden;
`;

const TabBar = styled.div`
  display: flex; background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Tab = styled.button`
  padding: 18px 30px; background: none; border: none;
  color: ${props => props.active ? '#378ADD' : '#888'};
  font-weight: 600; font-size: 0.9rem; cursor: pointer;
  position: relative; transition: all 0.2s;

  &:after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px;
    background: #378ADD; transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s;
  }
`;

const TabBody = styled.div` padding: 30px; `;

const AlertBanner = styled.div`
  background: rgba(231, 76, 60, 0.1); color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
  padding: 15px 20px; border-radius: 12px; margin-bottom: 25px;
  display: flex; align-items: center; gap: 12px; font-size: 0.9rem;
`;

const Table = styled.table`
  width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;
  th { padding: 15px; color: #666; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); }
  td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.03); }
`;

const Badge = styled.div`
  padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex;
  &.good { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
  &.warning { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }
  &.critical { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }
`;

const HeatmapContainer = styled.div`
  margin-top: 40px;
  h3 { margin-bottom: 20px; font-size: 1.1rem; }
`;

const HeatmapGrid = styled.div`
  display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;
`;

const DayCell = styled.div`
  background: ${props => props.$color || 'rgba(255,255,255,0.02)'};
  aspect-ratio: 1; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px; font-size: 0.8rem; color: ${props => props.$color ? '#fff' : '#444'};
  .date { font-weight: 700; }
  .pct { font-size: 0.65rem; opacity: 0.8; }
`;

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState('By Session');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState({
    batch: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    search: ''
  });

  const fetchGlobalAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', `${filters.month}-01`)
        .lt('date', new Date(new Date(filters.month + '-01').setMonth(new Date(filters.month + '-01').getMonth() + 1)).toISOString().split('T')[0]);
      
      if (error) throw error;
      setRecords(data || []);

      // Get student names for the summary tab
      const { data: sData } = await supabase.from('admissions').select('id, name, batch').eq('status', 'Active');
      if (sData) setStudents(sData);

    } catch (err) {
      toast.error("Failed to load attendance logs");
    } finally {
      setLoading(false);
    }
  }, [filters.month]);

  useEffect(() => {
    fetchGlobalAttendance();
  }, [fetchGlobalAttendance]);

  // Group by session
  const sessions = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const key = `${r.date}_${r.batch_id}`;
      if (!map[key]) {
        map[key] = { 
          date: r.date, 
          day: r.day_of_week, 
          batch: r.batch_name, 
          course: r.course,
          present: 0, absent: 0, late: 0, total: 0 
        };
      }
      map[key].total += 1;
      map[key][r.status] += 1;
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  // Group by student
  const studentStats = useMemo(() => {
    const map = {};
    records.forEach(r => {
      if (!map[r.student_id]) {
        const std = students.find(s => s.id === r.student_id);
        map[r.student_id] = { 
          id: r.student_id,
          name: std?.name || 'Unknown', 
          cnic: std?.cnic || '—',
          batch: std?.batch || '—',
          present: 0, absent: 0, late: 0, total: 0 
        };
      }
      map[r.student_id].total += 1;
      map[r.student_id][r.status] += 1;
    });
    return Object.values(map).map(s => ({
      ...s,
      pct: Math.round(((s.present + s.late) / s.total) * 100)
    })).sort((a, b) => a.pct - b.pct);
  }, [records, students]);

  const atRiskCount = studentStats.filter(s => s.pct < 75).length;
  const overallAvg = studentStats.length > 0 
    ? Math.round(studentStats.reduce((sum, s) => sum + s.pct, 0) / studentStats.length) 
    : 0;

  return (
    <AdminLayout>
      <Container>
        <Header>
          <div>
            <h1>Attendance Insights</h1>
            <p>Monitor attendance health across all batches</p>
          </div>
          <ExportBtn><FaDownload /> Export CSV</ExportBtn>
        </Header>

        <StatsGrid>
          {loading ? (
            [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard>
                <div className="label">Overall Avg Attendance</div>
                <div className="value">{overallAvg}%</div>
                <div className="trend" style={{color:'#2ecc71'}}><FaChartLine /> Institue Wide</div>
              </StatCard>
              <StatCard>
                <div className="label">Sessions Held</div>
                <div className="value">{sessions.length}</div>
                <div className="trend" style={{color:'#888'}}><FaCalendarAlt /> This Month</div>
              </StatCard>
              <StatCard>
                <div className="label">Students at Risk</div>
                <div className="value" style={{color:'#e74c3c'}}>{atRiskCount}</div>
                <div className="trend" style={{color:'#e74c3c'}}><FaExclamationCircle /> Below 75%</div>
              </StatCard>
              <StatCard>
                <div className="label">Perfect Records</div>
                <div className="value" style={{color:'#2ecc71'}}>{studentStats.filter(s => s.pct === 100).length}</div>
                <div className="trend" style={{color:'#2ecc71'}}><FaCheckCircle /> 100% Attendance</div>
              </StatCard>
            </>
          )}
        </StatsGrid>

        <FilterCard>
          <FilterGrid>
            <FormGroup>
              <label>Filter Month</label>
              <input type="month" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} />
            </FormGroup>
            <FormGroup>
              <label>Search Student</label>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                <input style={{ paddingLeft: '40px' }} placeholder="Name or CNIC..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
              </div>
            </FormGroup>
          </FilterGrid>
        </FilterCard>

        <TabContainer>
          <TabBar>
            <Tab active={activeTab === 'By Session'} onClick={() => setActiveTab('By Session')}>By Session</Tab>
            <Tab active={activeTab === 'By Student'} onClick={() => setActiveTab('By Student')}>By Student</Tab>
          </TabBar>

          <TabBody>
            {atRiskCount > 0 && (
              <AlertBanner>
                <FaExclamationCircle />
                {atRiskCount} students have attendance below 75% this month. Consider reaching out to them.
              </AlertBanner>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'By Session' ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Batch</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Attendance %</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(6)].map((_, i) => (
                          <tr key={i}>
                            <td><Skeleton height="20px" width="100px" /></td>
                            <td><Skeleton height="20px" width="60px" /></td>
                            <td><Skeleton height="35px" width="120px" /></td>
                            <td><Skeleton height="20px" width="40px" /></td>
                            <td><Skeleton height="20px" width="40px" /></td>
                            <td><Skeleton height="20px" width="40px" /></td>
                            <td><Skeleton height="24px" width="60px" radius="12px" /></td>
                            <td><Skeleton height="20px" width="20px" /></td>
                          </tr>
                        ))
                      ) : sessions.map((s, idx) => (
                        <tr key={idx}>
                          <td>{s.date}</td>
                          <td style={{color:'#888'}}>{s.day}</td>
                          <td><strong>{s.batch}</strong><br/><small style={{color:'#666'}}>{s.course}</small></td>
                          <td style={{color:'#2ecc71'}}>{s.present}</td>
                          <td style={{color:'#e74c3c'}}>{s.absent}</td>
                          <td style={{color:'#f1c40f'}}>{s.late}</td>
                          <td>
                            <Badge className={Math.round(((s.present + s.late)/s.total)*100) >= 80 ? 'good' : 'warning'}>
                              {Math.round(((s.present + s.late)/s.total)*100)}%
                            </Badge>
                          </td>
                          <td style={{textAlign:'right'}}>
                            <button style={{background:'none', border:'none', color:'#378ADD', cursor:'pointer'}}><FaChevronRight/></button>
                          </td>
                        </tr>
                      ))}
                      {sessions.length === 0 && <tr><td colSpan="8" style={{textAlign:'center', padding:'50px', color:'#444'}}>No sessions recorded for this period.</td></tr>}
                    </tbody>
                  </Table>
                </motion.div>
              ) : (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <Table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Batch</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Total</th>
                        <th>Attendance %</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(6)].map((_, i) => (
                          <tr key={i}>
                            <td><Skeleton height="35px" width="150px" /></td>
                            <td><Skeleton height="20px" width="100px" /></td>
                            <td><Skeleton height="20px" width="40px" /></td>
                            <td><Skeleton height="20px" width="40px" /></td>
                            <td><Skeleton height="20px" width="40px" /></td>
                            <td><Skeleton height="20px" width="40px" /></td>
                            <td><Skeleton height="24px" width="60px" radius="12px" /></td>
                            <td><Skeleton height="24px" width="80px" radius="12px" /></td>
                          </tr>
                        ))
                      ) : studentStats.filter(s => s.name.toLowerCase().includes(filters.search.toLowerCase())).map((s, idx) => (
                        <tr key={idx}>
                          <td><strong>{s.name}</strong><br/><small style={{color:'#666'}}>{s.cnic}</small></td>
                          <td>{s.batch}</td>
                          <td>{s.present}</td>
                          <td>{s.absent}</td>
                          <td>{s.late}</td>
                          <td>{s.total}</td>
                          <td style={{fontWeight:'700'}}>{s.pct}%</td>
                          <td>
                            <Badge className={s.pct >= 80 ? 'good' : s.pct >= 60 ? 'warning' : 'critical'}>
                              {s.pct >= 80 ? 'Good' : s.pct >= 60 ? 'Warning' : 'Critical'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </motion.div>
              )}
            </AnimatePresence>
          </TabBody>
        </TabContainer>

        <HeatmapContainer>
          <h3>Institute Attendance Heatmap</h3>
          <HeatmapGrid>
            {/* Mocking a simple grid for the current month */}
            {[...Array(30)].map((_, i) => {
              const date = `${filters.month}-${(i+1).toString().padStart(2, '0')}`;
              const daySessions = sessions.filter(s => s.date === date);
              const avg = daySessions.length > 0 
                ? Math.round(daySessions.reduce((sum, s) => sum + ((s.present + s.late)/s.total)*100, 0) / daySessions.length)
                : null;
              
              const color = avg === null ? null : (avg >= 80 ? 'rgba(46, 204, 113, 0.4)' : avg >= 60 ? 'rgba(241, 196, 15, 0.4)' : 'rgba(231, 76, 60, 0.4)');
              
              return (
                <DayCell key={i} $color={color}>
                  <span className="date">{i+1}</span>
                  {avg && <span className="pct">{avg}%</span>}
                </DayCell>
              );
            })}
          </HeatmapGrid>
        </HeatmapContainer>
      </Container>
    </AdminLayout>
  );
};

export default AdminAttendance;
