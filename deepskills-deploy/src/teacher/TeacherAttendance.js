import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, FaTimes, FaClock, FaHistory, FaCalendarCheck, 
  FaSave, FaExclamationTriangle, FaFilter
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { getAssignedTeacherBatches, getTeacherByCnic } from '../utils/teacherUtils';

const Container = styled.div`
  padding: 20px 0;
  color: #fff;
`;

const Header = styled.div`
  margin-bottom: 30px;
  h1 { font-size: 2rem; font-weight: 800; margin-bottom: 5px; }
  p { color: #888; font-size: 1rem; }
`;

const TabContainer = styled.div`
  background: #111318;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  margin-bottom: 30px;
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Tab = styled.button`
  padding: 18px 30px;
  background: none; border: none;
  color: ${props => props.active ? '#378ADD' : '#888'};
  font-weight: 600; font-size: 0.9rem;
  cursor: pointer; position: relative;
  transition: all 0.2s;

  &:after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px;
    background: #378ADD; transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s;
  }
  &:hover { color: #fff; }
`;

const TabBody = styled.div` padding: 30px; `;

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 8px;
  label { font-size: 0.85rem; color: #888; display: flex; align-items: center; gap: 6px; }
  select, input {
    background: #0a0a0a; border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px; padding: 12px; color: #fff; outline: none;
    &:focus { border-color: #378ADD; }
  }
`;

const BatchBanner = styled.div`
  background: ${props => props.$type === 'success' ? 'rgba(46, 204, 113, 0.1)' : 'rgba(241, 196, 15, 0.1)'};
  color: ${props => props.$type === 'success' ? '#2ecc71' : '#f1c40f'};
  border: 1px solid ${props => props.$type === 'success' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)'};
  padding: 15px 20px; border-radius: 12px; margin-bottom: 25px;
  display: flex; align-items: center; gap: 12px; font-size: 0.9rem;
`;

const SheetHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
  h3 { font-size: 1.1rem; display: flex; align-items: center; gap: 10px; }
  .count { color: #888; font-size: 0.85rem; }
`;

const QuickActions = styled.div`
  display: flex; gap: 10px;
  button {
    padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05); color: #fff;
    &:hover { background: rgba(255, 255, 255, 0.1); }
    &.present:hover { border-color: #2ecc71; color: #2ecc71; }
    &.absent:hover { border-color: #e74c3c; color: #e74c3c; }
  }
`;

const StudentGrid = styled.div`
  display: flex; flex-direction: column; gap: 12px;
`;

const StudentRow = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 15px 20px; border-radius: 12px;
  display: flex; justify-content: space-between; align-items: center;
  transition: all 0.2s;
  &:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.1); }

  .student-info {
    display: flex; align-items: center; gap: 15px;
    .avatar {
      width: 40px; height: 40px; background: #222; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #378ADD; border: 1px solid rgba(55, 138, 221, 0.2);
    }
    .details {
      h4 { font-size: 0.95rem; margin-bottom: 2px; }
      p { font-size: 0.75rem; color: #666; }
    }
  }

  .stats {
    display: flex; align-items: center; gap: 20px;
    .badge {
      padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;
      &.good { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
      &.warning { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }
      &.critical { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }
    }
  }
`;

const ToggleGroup = styled.div`
  display: flex; background: #0a0a0a; border-radius: 10px; padding: 4px; gap: 4px;
`;

const ToggleButton = styled.button`
  padding: 8px 16px; border-radius: 8px; border: none; font-size: 0.8rem; font-weight: 700;
  cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px;
  background: transparent; color: #555;

  &.present.active { background: #2ecc71; color: #fff; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2); }
  &.absent.active { background: #e74c3c; color: #fff; box-shadow: 0 4px 12px rgba(231, 76, 60, 0.2); }
  &.late.active { background: #f1c40f; color: #fff; box-shadow: 0 4px 12px rgba(241, 196, 15, 0.2); }

  &:hover:not(.active) { color: #888; background: rgba(255, 255, 255, 0.05); }
`;

const StickyBar = styled.div`
  position: sticky; bottom: 30px;
  background: #111318; border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 15px 30px; border-radius: 16px;
  display: flex; justify-content: space-between; align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 10;
  margin-top: 40px;

  .progress {
    display: flex; align-items: center; gap: 15px;
    .text { font-size: 0.9rem; font-weight: 600; }
    .track { width: 120px; height: 6px; background: #222; border-radius: 3px; overflow: hidden; }
    .fill { height: 100%; background: #378ADD; transition: width 0.3s; }
  }
`;

const SaveButton = styled.button`
  padding: 12px 30px; border-radius: 10px; background: #378ADD; color: #fff;
  border: none; font-weight: 700; font-size: 0.9rem; cursor: pointer;
  display: flex; align-items: center; gap: 8px; transition: all 0.2s;
  
  &:hover { background: #2a6db0; transform: translateY(-2px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
`;

const TeacherAttendance = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Mark Sheet');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [markingData, setMarkingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [teacherRecord, setTeacherRecord] = useState(null);

  // Fetch batches assigned to teacher
  useEffect(() => {
    const fetchBatches = async () => {
      setLoading(true);
      try {
        const teacher = await getTeacherByCnic(user.cnic);
        setTeacherRecord(teacher);

        const mapped = await getAssignedTeacherBatches(teacher.id);
        setBatches(mapped);
        if (mapped.length > 0) setSelectedBatch(mapped[0]);
      } catch (err) {
        console.error("Batch fetch error:", err);
        toast.error("Error loading batches");
      } finally {
        setLoading(false);
      }
    };
    if (user?.cnic) fetchBatches();
  }, [user?.cnic]);

  // Fetch students for selected batch and existing attendance for selected date
  const fetchData = useCallback(async () => {
    if (!selectedBatch) return;
    setLoading(true);
    try {
      // 1. Get Students
      const { data: stdData, error: stdError } = await supabase
        .from('admissions')
        .select('*')
        .eq('batch', selectedBatch.batch_name)
        .eq('status', 'Active');
      
      if (stdError) throw stdError;

      // 2. Get Existing Attendance
      const { data: attData, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('batch_id', selectedBatch.id)
        .eq('date', selectedDate);
      
      if (attError) throw attError;

      // 3. Get Student Stats (Overall Attendance %)
      const { data: statsData } = await supabase
        .from('attendance')
        .select('student_id, status')
        .eq('batch_id', selectedBatch.id);

      const statsMap = {};
      statsData?.forEach(s => {
        if (!statsMap[s.student_id]) statsMap[s.student_id] = { total: 0, present: 0 };
        statsMap[s.student_id].total += 1;
        if (s.status === 'present' || s.status === 'late') statsMap[s.student_id].present += 1;
      });

      const studentsWithStats = stdData.map(s => ({
        ...s,
        avgAtt: statsMap[s.id] ? Math.round((statsMap[s.id].present / statsMap[s.id].total) * 100) : 100
      }));

      setStudents(studentsWithStats);

      // 4. Set Marking State
      const marking = {};
      attData.forEach(a => { marking[a.student_id] = a.status; });
      setMarkingData(marking);
      setIsSaved(attData.length > 0);

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMark = (studentId, status) => {
    setMarkingData(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const fresh = {};
    students.forEach(s => { fresh[s.id] = status; });
    setMarkingData(fresh);
  };

  const handleSave = async () => {
    if (!teacherRecord?.id || !selectedBatch) return;
    setProcessing(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        student_name: s.name,
        teacher_id: teacherRecord.id,
        batch_id: selectedBatch.id,
        batch_name: selectedBatch.batch_name,
        course: selectedBatch.course,
        date: selectedDate,
        day_of_week: new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }),
        status: markingData[s.id],
        marked_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('attendance').upsert(records, { onConflict: 'student_id, date' });
      if (error) throw error;

      toast.success(`Attendance saved for ${selectedBatch.batch_name} — ${selectedDate}`);
      setIsSaved(true);

      // Trigger result recomputation for all students in this batch
      try {
        const { computeAndCacheResult } = await import('../utils/resultUtils');
        for (const s of students) {
          await computeAndCacheResult(s.id, 'midterm');
          await computeAndCacheResult(s.id, 'finalterm');
        }
      } catch (calcErr) {
        console.error("Calculation trigger failed:", calcErr);
      }

      fetchData(); // Refresh stats
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const markedCount = Object.keys(markingData).length;
  const isReady = markedCount === students.length && students.length > 0;
  const progressPercent = students.length > 0 ? (markedCount / students.length) * 100 : 0;

  return (
    <DashboardLayout>
      <Container>
        <Header>
          <h1>Attendance</h1>
          <p>Mark and manage attendance for your batches</p>
        </Header>

        <TabContainer>
          <TabBar>
            <Tab active={activeTab === 'Mark Sheet'} onClick={() => setActiveTab('Mark Sheet')}>Mark Sheet</Tab>
            <Tab active={activeTab === 'History'} onClick={() => setActiveTab('History')}>History</Tab>
          </TabBar>

          <TabBody>
            <AnimatePresence mode="wait">
              {activeTab === 'Mark Sheet' ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <FilterBar>
                    <FormGroup>
                      <label><FaFilter /> Select Batch</label>
                      <select 
                        value={selectedBatch?.id || ''} 
                        onChange={(e) => setSelectedBatch(batches.find(b => b.id === e.target.value))}
                      >
                        {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name} — {b.course}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup>
                      <label><FaHistory /> Attendance Date</label>
                      <input 
                        type="date" 
                        value={selectedDate} 
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)} 
                      />
                    </FormGroup>
                    <FormGroup>
                      <label><FaClock /> Class Timing</label>
                      <div style={{ background: '#0a0a0a', padding: '12px', borderRadius: '10px', fontSize: '0.9rem', color: '#378ADD', border: '1px solid rgba(55,138,221,0.2)' }}>
                        {selectedBatch?.time_shift || selectedBatch?.batch_timing || "Not set"}
                      </div>
                    </FormGroup>
                  </FilterBar>

                  {isSaved && (
                    <BatchBanner $type="success">
                      <FaCalendarCheck size={20} />
                      Attendance already marked for this date. You can still update it.
                    </BatchBanner>
                  )}

                  {!isSaved && selectedDate < new Date().toISOString().split('T')[0] && (
                    <BatchBanner $type="warning">
                      <FaExclamationTriangle size={20} />
                      Attendance was not marked for this date.
                    </BatchBanner>
                  )}

                  <SheetHeader>
                    <h3>
                      Marking: {selectedBatch?.batch_name} 
                      <span className="count">({students.length} students)</span>
                    </h3>
                    <QuickActions>
                      <button className="present" onClick={() => markAll('present')}>Mark All Present</button>
                      <button className="absent" onClick={() => markAll('absent')}>Mark All Absent</button>
                      <button onClick={() => setMarkingData({})}>Reset All</button>
                    </QuickActions>
                  </SheetHeader>

                  <StudentGrid>
                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading students...</div>
                    ) : (
                      students.map((s, idx) => (
                        <StudentRow 
                          key={s.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <div className="student-info">
                            <div className="avatar">{s.name[0]}</div>
                            <div className="details">
                              <h4>{s.name}</h4>
                              <p>{s.cnic}</p>
                            </div>
                          </div>

                          <div className="stats">
                            <div className={`badge ${s.avgAtt >= 80 ? 'good' : s.avgAtt >= 60 ? 'warning' : 'critical'}`}>
                              {s.avgAtt}% Att.
                            </div>
                            <ToggleGroup>
                              <ToggleButton 
                                className={`present ${markingData[s.id] === 'present' ? 'active' : ''}`}
                                onClick={() => handleMark(s.id, 'present')}
                              >
                                <FaCheck /> Present
                              </ToggleButton>
                              <ToggleButton 
                                className={`absent ${markingData[s.id] === 'absent' ? 'active' : ''}`}
                                onClick={() => handleMark(s.id, 'absent')}
                              >
                                <FaTimes /> Absent
                              </ToggleButton>
                              <ToggleButton 
                                className={`late ${markingData[s.id] === 'late' ? 'active' : ''}`}
                                onClick={() => handleMark(s.id, 'late')}
                              >
                                <FaClock /> Late
                              </ToggleButton>
                            </ToggleGroup>
                          </div>
                        </StudentRow>
                      ))
                    )}
                  </StudentGrid>

                  <StickyBar>
                    <div className="progress">
                      <div className="text">{markedCount} of {students.length} marked</div>
                      <div className="track">
                        <div className="fill" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                    <SaveButton onClick={handleSave} disabled={!isReady || processing}>
                      {processing ? "Saving..." : isSaved ? "Update Attendance" : "Save Attendance"} <FaSave />
                    </SaveButton>
                  </StickyBar>
                </motion.div>
              ) : (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {/* History Tab Content */}
                  <div style={{ textAlign: 'center', padding: '100px 0', color: '#555' }}>
                    <FaHistory size={50} style={{ marginBottom: '20px' }} />
                    <h3>Attendance History</h3>
                    <p>Coming soon: Filter by month and view detailed logs.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabBody>
        </TabContainer>
      </Container>
    </DashboardLayout>
  );
};

export default TeacherAttendance;
