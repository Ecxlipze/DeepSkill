import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaEdit, FaUserSlash, FaCheckCircle, 
  FaTimesCircle, FaPlus, FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import AdminLayout from '../components/AdminLayout';

const Container = styled.div`
  padding: 20px 0;
  color: #fff;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #888;
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 25px;
  transition: color 0.2s;
  &:hover { color: #fff; }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

// LEFT COLUMN
const SidebarCard = styled.div`
  background: #111318;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 30px;
  height: fit-content;
  position: sticky;
  top: 100px;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 30px;

  .avatar {
    width: 80px;
    height: 80px;
    background: transparent;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 15px;
    border: 4px solid #378ADD;
  }

  h2 { font-size: 1.4rem; margin-bottom: 5px; }
  .specialization { color: #888; font-size: 0.9rem; margin-bottom: 15px; }
`;

const StatusBadge = styled.div`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => props.$active ? 'rgba(46, 204, 113, 0.1)' : 'rgba(107, 114, 128, 0.1)'};
  color: ${props => props.$active ? '#2ecc71' : '#9ca3af'};
  border: 1px solid ${props => props.$active ? 'rgba(46, 204, 113, 0.2)' : 'rgba(107, 114, 128, 0.2)'};
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  .label { color: #666; }
  .value { color: #fff; font-weight: 500; }
`;

const AssignedBatches = styled.div`
  margin-bottom: 30px;
  h4 { font-size: 0.8rem; text-transform: uppercase; color: #555; margin-bottom: 15px; }
  .batch-list { display: flex; flex-direction: column; gap: 8px; }
`;

const BatchItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.02);
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.05);

  .info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    .name { font-weight: 600; }
    .role { color: #378ADD; font-size: 0.75rem; }
  }

  button {
    background: none; border: none; color: #555; cursor: pointer;
    &:hover { color: #e74c3c; }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &.edit { background: transparent; border: 1px solid #3498db; color: #3498db; &:hover { background: rgba(52, 152, 219, 0.1); } }
  &.batches { background: transparent; border: 1px solid #9b59b6; color: #9b59b6; &:hover { background: rgba(155, 89, 182, 0.1); } }
  &.status { background: transparent; border: 1px solid ${props => props.$active ? '#95a5a6' : '#2ecc71'}; color: ${props => props.$active ? '#95a5a6' : '#2ecc71'}; &:hover { background: ${props => props.$active ? 'rgba(149, 165, 166, 0.1)' : 'rgba(46, 204, 113, 0.1)'}; } }
  &.revoke { background: transparent; border: 1px solid #e74c3c; color: #e74c3c; &:hover { background: rgba(231, 76, 60, 0.1); } }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

// RIGHT COLUMN
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TabContainer = styled.div`
  background: #111318;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
`;

const TabBar = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 0 10px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const Tab = styled.button`
  padding: 18px 25px;
  background: none; border: none;
  color: ${props => props.active ? '#378ADD' : '#888'};
  font-weight: 600; font-size: 0.9rem;
  cursor: pointer; position: relative;
  transition: all 0.2s; white-space: nowrap;

  &:after {
    content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px;
    background: #378ADD; transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s;
  }
  &:hover { color: #fff; }
`;

const TabBody = styled.div` padding: 30px; `;

// TAB COMPONENTS
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MiniStat = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 20px; border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  .val { font-size: 1.6rem; font-weight: 700; color: #fff; margin-bottom: 5px; }
  .lab { color: #666; font-size: 0.8rem; text-transform: uppercase; }
`;

const PerformanceBar = styled.div`
  margin-bottom: 20px;
  .header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; }
  .track { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
  .fill { height: 100%; background: #378ADD; width: ${props => props.percent}%; transition: width 0.5s ease; }
`;

const Table = styled.table`
  width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;
  th { padding: 15px; color: #666; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); }
  td { padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.03); }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: #111318; width: 100%; max-width: 500px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1); padding: 30px; position: relative;
`;

const ModalHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
  h3 { font-size: 1.2rem; }
  button { background: none; border: none; color: #555; cursor: pointer; &:hover { color: #fff; } }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  label { display: block; margin-bottom: 8px; font-size: 0.85rem; color: #888; }
  input, select, textarea {
    width: 100%; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px; padding: 12px; color: #fff; outline: none;
    &:focus { border-color: #378ADD; }
  }
`;

const SubmitBtn = styled.button`
  width: 100%; padding: 14px; background: #378ADD; color: #fff; border: none;
  border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 10px;
  &:hover { background: #2a6db0; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Performance');
  const [processing, setProcessing] = useState(false);

  // Data
  const [assignments, setAssignments] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [salaryConfig, setSalaryConfig] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Modals
  const [isManageBatchesOpen, setIsManageBatchesOpen] = useState(false);
  const [isSalarySetupOpen, setIsSalarySetupOpen] = useState(false);
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [newAssignment, setNewAssignment] = useState({ course: '', batch_id: '', role: 'Main' });

  const fetchTeacherData = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('teachers').select('*').eq('id', id).single();
      if (error) throw error;
      setTeacher(data);

      const [assRes, batchRes, courseRes] = await Promise.all([
        supabase.from('teacher_batches').select('*, batches(*)').eq('teacher_id', id),
        supabase.from('batches').select('*'),
        supabase.from('courses').select('*')
      ]);

      setAssignments(assRes.data || []);
      setAllBatches(batchRes.data || []);
      setAllCourses(courseRes.data || []);
      
      // Fetch Salary Config
      const { data: salary } = await supabase.from('teacher_salaries').select('*').eq('teacher_id', id).single();
      if (salary) {
        setSalaryConfig(salary);
        setMonthlySalary(salary.monthly_amount);
      }

      // Fetch Payment History
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('entity_id', id)
        .eq('entity_type', 'teacher')
        .order('paid_date', { ascending: false });
      setPaymentHistory(payments || []);
      
      // Mock performance metrics for demo
      // In real app, compute these from tasks/complaints tables
    } catch (err) {
      toast.error("Error loading teacher profile");
      navigate('/admin/teachers');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  const handleAddAssignment = async () => {
    if (!newAssignment.batch_id) return;
    
    // Check if teacher is already assigned to this batch
    const isAlreadyAssigned = assignments.some(a => a.batch_id === newAssignment.batch_id);
    if (isAlreadyAssigned) {
      toast.error("Teacher is already assigned to this batch");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase.from('teacher_batches').insert([{
        teacher_id: id,
        batch_id: newAssignment.batch_id,
        role: newAssignment.role
      }]);
      if (error) throw error;
      toast.success("Batch assigned successfully");
      fetchTeacherData();
      setNewAssignment({ course: '', batch_id: '', role: 'Main' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const removeAssignment = async (assId, batchName, role) => {
    // Safety check for last main teacher could be added here
    if (!window.confirm(`Remove ${teacher.name} from ${batchName}?`)) return;
    try {
      await supabase.from('teacher_batches').delete().eq('id', assId);
      toast.success("Assignment removed");
      fetchTeacherData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleStatus = async () => {
    const newStatus = teacher.status === 'Active' ? 'Inactive' : 'Active';
    if (!window.confirm(`Mark as ${newStatus}?`)) return;
    try {
      await supabase.from('teachers').update({ status: newStatus }).eq('id', id);
      setTeacher({ ...teacher, status: newStatus });
      toast.success(`Teacher marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateSalary = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase.from('teacher_salaries').upsert({
        teacher_id: id,
        monthly_amount: monthlySalary,
        effective_from: new Date().toISOString().split('T')[0]
      }, { onConflict: 'teacher_id' });

      if (error) throw error;
      toast.success("Salary configuration updated");
      setIsSalarySetupOpen(false);
      fetchTeacherData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <AdminLayout><Container style={{textAlign:'center',paddingTop:'100px'}}>Loading...</Container></AdminLayout>;

  const initials = teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AdminLayout>
      <Container>
        <BackLink to="/admin/teachers"><FaArrowLeft /> Back to Teachers</BackLink>
        <Layout>
          {/* SIDEBAR */}
          <SidebarCard>
            <ProfileHeader>
              <div className="avatar">{initials}</div>
              <h2>{teacher.name}</h2>
              <div className="specialization">{teacher.specialization}</div>
              <StatusBadge $active={teacher.status === 'Active'}>{teacher.status}</StatusBadge>
            </ProfileHeader>

            <InfoGrid>
              <InfoRow><span className="label">CNIC</span><span className="value">{teacher.cnic}</span></InfoRow>
              <InfoRow><span className="label">Phone</span><span className="value">{teacher.phone}</span></InfoRow>
              <InfoRow><span className="label">Email</span><span className="value">{teacher.email}</span></InfoRow>
              <InfoRow><span className="label">Added On</span><span className="value">{new Date(teacher.added_on || '2025-01-01').toLocaleDateString()}</span></InfoRow>
            </InfoGrid>

            <AssignedBatches>
              <h4>Assignments</h4>
              <div className="batch-list">
                {assignments.map(a => (
                  <BatchItem key={a.id}>
                    <div className="info">
                      <span className="name">{a.batches?.batch_name}</span>
                      <span className="role">{a.role} Teacher</span>
                    </div>
                    <button onClick={() => removeAssignment(a.id, a.batches?.batch_name)}><FaTimes /></button>
                  </BatchItem>
                ))}
              </div>
            </AssignedBatches>

            <ActionButtons>
              <Button className="edit"><FaEdit /> Edit Details</Button>
              <Button className="batches" onClick={() => setIsManageBatchesOpen(true)}><FaPlus /> Manage Batches</Button>
              <Button className="status" $active={teacher.status === 'Active'} onClick={toggleStatus}>
                {teacher.status === 'Active' ? <><FaUserSlash /> Mark Inactive</> : <><FaCheckCircle /> Mark Active</>}
              </Button>
              <Button className="revoke"><FaTimesCircle /> Revoke Access</Button>
            </ActionButtons>
          </SidebarCard>

          {/* CONTENT */}
          <MainContent>
            <TabContainer>
              <TabBar>
                {['Performance', 'Tasks', 'Complaints', 'Batches', 'Finance'].map(t => (
                  <Tab key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>{t}</Tab>
                ))}
              </TabBar>

              <TabBody>
                {activeTab === 'Performance' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                    <StatsGrid>
                      <MiniStat><div className="val">87%</div><div className="lab">Task Completion</div></MiniStat>
                      <MiniStat><div className="val">2.4h</div><div className="lab">Response Time</div></MiniStat>
                      <MiniStat><div className="val">94%</div><div className="lab">Resolution Rate</div></MiniStat>
                    </StatsGrid>
                    <PerformanceBar percent={83}><div className="header"><span>Student Attendance</span><span>83%</span></div><div className="track"><div className="fill" /></div></PerformanceBar>
                    <PerformanceBar percent={90}><div className="header"><span>Tasks Assigned (Month)</span><span>24</span></div><div className="track"><div className="fill" /></div></PerformanceBar>
                  </motion.div>
                )}

                {activeTab === 'Finance' && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                      <StatsGrid style={{ flex: 1, marginBottom: 0 }}>
                        <MiniStat>
                          <div className="val">Rs. {salaryConfig?.monthly_amount.toLocaleString() || '0'}</div>
                          <div className="lab">Monthly Salary</div>
                        </MiniStat>
                        <MiniStat>
                          <div className="val">{paymentHistory.length}</div>
                          <div className="lab">Payments Made</div>
                        </MiniStat>
                      </StatsGrid>
                      <SubmitBtn 
                        style={{ width: '200px', marginTop: 0, marginLeft: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} 
                        onClick={() => setIsSalarySetupOpen(true)}
                      >
                        <FaEdit /> Setup Salary
                      </SubmitBtn>
                    </div>

                    <h4 style={{ marginBottom: '15px', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>Payment History</h4>
                    <div style={{ background: '#0a0a0a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Table>
                        <thead>
                          <tr>
                            <th>Month/Description</th>
                            <th>Amount</th>
                            <th>Paid Date</th>
                            <th>Method</th>
                            <th>Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentHistory.map(p => (
                            <tr key={p.id}>
                              <td>{p.description}</td>
                              <td style={{ fontWeight: '700', color: '#10B981' }}>Rs. {p.amount.toLocaleString()}</td>
                              <td>{p.paid_date}</td>
                              <td style={{ textTransform: 'capitalize' }}>{p.method?.replace('_', ' ')}</td>
                              <td style={{ color: '#6b7280' }}>{p.reference_number || '—'}</td>
                            </tr>
                          ))}
                          {paymentHistory.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#555' }}>No payment records found.</td></tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </motion.div>
                )}
              </TabBody>
            </TabContainer>
          </MainContent>
        </Layout>
      </Container>

      {/* MODALS */}
      <AnimatePresence>
        {isManageBatchesOpen && (
          <ModalOverlay initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <ModalContent initial={{y:20}} animate={{y:0}}>
              <ModalHeader><h3>Manage Batches</h3><button onClick={() => setIsManageBatchesOpen(false)}><FaTimes /></button></ModalHeader>
              <FormGroup>
                <label>Course</label>
                <select value={newAssignment.course} onChange={e => setNewAssignment({...newAssignment, course: e.target.value})}>
                  <option value="">Select Course</option>
                  {allCourses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                </select>
              </FormGroup>
              <FormGroup>
                <label>Batch</label>
                <select value={newAssignment.batch_id} onChange={e => setNewAssignment({...newAssignment, batch_id: e.target.value})}>
                  <option value="">Select Batch</option>
                  {allBatches.filter(b => b.course === newAssignment.course).map(b => <option key={b.id} value={b.id}>{b.batch_name}</option>)}
                </select>
              </FormGroup>
              <FormGroup>
                <label>Role</label>
                <select value={newAssignment.role} onChange={e => setNewAssignment({...newAssignment, role: e.target.value})}>
                  <option value="Main">Main Teacher</option>
                  <option value="Assistant">Assistant Teacher</option>
                </select>
              </FormGroup>
              <SubmitBtn onClick={handleAddAssignment} disabled={processing}>{processing ? "Assigning..." : "Add Assignment"}</SubmitBtn>
            </ModalContent>
          </ModalOverlay>
        )}
        {isSalarySetupOpen && (
          <ModalOverlay initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <ModalContent initial={{y:20}} animate={{y:0}}>
              <ModalHeader>
                <h3>Setup Teacher Salary</h3>
                <button onClick={() => setIsSalarySetupOpen(false)}><FaTimes /></button>
              </ModalHeader>
              <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(55, 138, 221, 0.1)', borderRadius: '10px', color: '#378ADD', fontSize: '0.9rem' }}>
                Set the fixed monthly salary for this teacher. This will be used for system-wide reporting.
              </div>
              <FormGroup>
                <label>Monthly Salary (PKR)</label>
                <input 
                  type="number" 
                  value={monthlySalary} 
                  onChange={(e) => setMonthlySalary(parseInt(e.target.value))} 
                />
              </FormGroup>
              <SubmitBtn onClick={handleUpdateSalary} disabled={processing}>
                {processing ? "Saving..." : "Save Configuration"}
              </SubmitBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default TeacherProfile;
