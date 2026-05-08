import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowLeft, FaEdit, FaUserSlash, FaCheckCircle, 
  FaTimesCircle, FaTimes, FaDollarSign, FaCalendarAlt, FaTrash
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
    background: #7B1F2E;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 15px;
    border: 4px solid rgba(255, 255, 255, 0.05);
  }

  h2 { font-size: 1.4rem; margin-bottom: 5px; }
  .cnic { color: #888; font-size: 0.9rem; margin-bottom: 15px; }
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
  
  &.edit {
    background: transparent;
    border: 1px solid #3498db;
    color: #3498db;
    &:hover { background: rgba(52, 152, 219, 0.1); }
  }

  &.status {
    background: transparent;
    border: 1px solid ${props => props.$active ? '#95a5a6' : '#2ecc71'};
    color: ${props => props.$active ? '#95a5a6' : '#2ecc71'};
    &:hover { background: ${props => props.$active ? 'rgba(149, 165, 166, 0.1)' : 'rgba(46, 204, 113, 0.1)'}; }
  }

  &.revoke {
    background: transparent;
    border: 1px solid #e74c3c;
    color: #e74c3c;
    &:hover { background: rgba(231, 76, 60, 0.1); }
  }

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
  background: none;
  border: none;
  color: ${props => props.active ? '#7B1F2E' : '#888'};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  white-space: nowrap;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: #7B1F2E;
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.2s;
  }

  &:hover { color: #fff; }
`;

const TabBody = styled.div`
  padding: 30px;
`;

// TAB COMPONENTS
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const MiniStat = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;

  .val { font-size: 1.6rem; font-weight: 700; color: #fff; margin-bottom: 5px; }
  .lab { color: #666; font-size: 0.8rem; text-transform: uppercase; }
`;

const ActivityFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 15px;
  
  .dot {
    width: 10px;
    height: 10px;
    background: #7B1F2E;
    border-radius: 50%;
    margin-top: 5px;
    flex-shrink: 0;
    box-shadow: 0 0 10px rgba(123, 31, 46, 0.5);
  }

  .content {
    .text { font-size: 0.95rem; color: #fff; margin-bottom: 4px; }
    .time { font-size: 0.8rem; color: #555; }
  }
`;

// SHARED COMPONENTS
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(motion.div)`
  background: #111318;
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 30px;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  h3 { font-size: 1.2rem; }
  button { 
    background: none; border: none; color: #555; cursor: pointer; 
    &:hover { color: #fff; }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  label { display: block; margin-bottom: 8px; font-size: 0.85rem; color: #888; }
  input, select, textarea {
    width: 100%;
    background: #0a0a0a;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    padding: 12px;
    color: #fff;
    outline: none;
    &:focus { border-color: #7B1F2E; }
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: #7B1F2E;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  &:hover { background: #9b283b; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, processing }) => (
  <AnimatePresence>
    {isOpen && (
      <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <ModalContent initial={{ y: 20 }} animate={{ y: 0 }}>
          <ModalHeader>
            <h3>{title}</h3>
            <button onClick={onClose}><FaTimes /></button>
          </ModalHeader>
          <p style={{ color: '#888', marginBottom: '25px', lineHeight: '1.5' }}>{message}</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} onClick={onClose}>Cancel</Button>
            <SubmitBtn style={{ marginTop: 0 }} onClick={onConfirm} disabled={processing}>
              {processing ? "Processing..." : "Confirm"}
            </SubmitBtn>
          </div>
        </ModalContent>
      </ModalOverlay>
    )}
  </AnimatePresence>
);

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Tab-specific data
  const [tasks, setTasks] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [finance, setFinance] = useState({ totalFee: 0, paid: 0, plan: null, payments: [] });
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  // Modals
  const [isEditBatchOpen, setIsEditBatchOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSetupFinanceOpen, setIsSetupFinanceOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fee generation states
  const [setupTotalFee, setSetupTotalFee] = useState(25000);
  const [setupPlanType, setSetupPlanType] = useState('installment');
  const [setupInstallments, setSetupInstallments] = useState(4);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const fetchStudentData = React.useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Student Info
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setStudent(data);

      // 2. Fetch Tasks & Submissions
      const { data: taskData } = await supabase.from('tasks').select('*').eq('course', data.course).eq('batch', data.batch);
      const { data: subData } = await supabase.from('task_submissions').select('*').eq('cnic', data.cnic);
      
      if (taskData) {
        const merged = taskData.map(t => ({
          ...t,
          submission: subData?.find(s => s.task_id === t.id)
        }));
        setTasks(merged);
      }

      // 3. Fetch Complaints
      const { data: compData } = await supabase.from('complaints').select('*').eq('student_cnic', data.cnic);
      if (compData) setComplaints(compData);
      
      // 5. Fetch Finance Data
      const { data: plan } = await supabase.from('fee_plans').select('*').eq('student_id', id).single();
      const { data: payments } = await supabase.from('payments').select('*').eq('entity_id', id).eq('entity_type', 'student').order('installment_number');
      
      const paidAmount = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0;

      setFinance({
        totalFee: plan?.total_fee || 0,
        paid: paidAmount,
        plan: plan,
        payments: payments || []
      });

    } catch (err) {
      console.error(err);
      toast.error("Error loading student profile");
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchStudentData();
    
    // Fetch available batches for editing
    const fetchBatches = async () => {
      const { data } = await supabase.from('batches').select('*');
      setAvailableBatches(data || []);
    };
    fetchBatches();
  }, [fetchStudentData]);

  const toggleStatus = async () => {
    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    setConfirmConfig({
      isOpen: true,
      title: "Change Status",
      message: `Are you sure you want to mark this student as ${newStatus}?`,
      onConfirm: async () => {
        setProcessing(true);
        try {
          // 1. Update Admissions
          const { error: admError } = await supabase
            .from('admissions')
            .update({ status: newStatus })
            .eq('id', id);
          
          if (admError) throw admError;

          // 2. Sync allowed_cnics
          if (newStatus === 'Inactive') {
            await supabase.from('allowed_cnics').delete().eq('cnic', student.cnic);
          } else {
            await supabase.from('allowed_cnics').upsert({
              cnic: student.cnic,
              name: student.name,
              role: 'student',
              assigned_course: student.course,
              batch: student.batch
            }, { onConflict: 'cnic' });
          }

          setStudent(prev => ({ ...prev, status: newStatus }));
          toast.success(`Student marked as ${newStatus}`);
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error("Failed to update status: " + err.message);
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const revokeAccess = async () => {
    setConfirmConfig({
      isOpen: true,
      title: "Revoke Dashboard Access",
      message: "Are you sure? This will immediately remove dashboard access and mark the student as Inactive.",
      onConfirm: async () => {
        setProcessing(true);
        try {
          await supabase.from('admissions').update({ status: 'Inactive' }).eq('id', id);
          await supabase.from('allowed_cnics').delete().eq('cnic', student.cnic);
          
          setStudent(prev => ({ ...prev, status: 'Inactive' }));
          toast.success("Dashboard access revoked successfully.");
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
          toast.error("Failed to revoke access: " + err.message);
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  const handleUpdateBatch = async () => {
    if (!selectedBatch) return;
    setProcessing(true);
    try {
      const newBatchData = availableBatches.find(b => b.batch_name === selectedBatch);
      
      // 1. Update Admissions
      const { error: admError } = await supabase
        .from('admissions')
        .update({ 
          batch: selectedBatch,
          batch_timing: newBatchData?.batch_timing || student.batch_timing
        })
        .eq('id', id);
      
      if (admError) throw admError;

      // 2. Sync allowed_cnics (if they are active)
      if (student.status === 'Active') {
        await supabase
          .from('allowed_cnics')
          .update({ batch: selectedBatch })
          .eq('cnic', student.cnic);
      }

      setStudent(prev => ({ 
        ...prev, 
        batch: selectedBatch,
        batch_timing: newBatchData?.batch_timing || prev.batch_timing
      }));
      
      toast.success("Batch updated successfully");
      setIsEditBatchOpen(false);
    } catch (err) {
      toast.error("Failed to update batch: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProcessing(true);
    try {
      // 1. Update Admissions
      const { error: admError } = await supabase
        .from('admissions')
        .update({ 
          name: editFormData.name,
          phone: editFormData.phone,
          email: editFormData.email,
          education: editFormData.education,
          cnic: editFormData.cnic,
          course: editFormData.course
        })
        .eq('id', id);
      
      if (admError) throw admError;

      // 2. Sync allowed_cnics
      if (student.status === 'Active') {
        if (editFormData.cnic !== student.cnic) {
            // Delete old CNIC
            await supabase.from('allowed_cnics').delete().eq('cnic', student.cnic);
            // Insert new CNIC
            await supabase.from('allowed_cnics').insert({
                cnic: editFormData.cnic,
                name: editFormData.name,
                role: 'student',
                assigned_course: editFormData.course,
                batch: student.batch
            });
        } else {
            // Update name/course
            await supabase.from('allowed_cnics').update({ 
                name: editFormData.name,
                assigned_course: editFormData.course
            }).eq('cnic', student.cnic);
        }
      }

      setStudent(prev => ({ ...prev, ...editFormData }));
      toast.success("Profile updated successfully");
      setIsEditProfileOpen(false);
    } catch (err) {
      toast.error("Failed to update profile: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteStudent = async () => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Student",
      message: "Are you absolutely sure? This will permanently delete the student and their access.",
      onConfirm: async () => {
        setProcessing(true);
        try {
          await supabase.from('allowed_cnics').delete().eq('cnic', student.cnic);
          const { error: delError } = await supabase.from('admissions').delete().eq('id', id);
          if (delError) throw delError;

          toast.success("Student deleted successfully.");
          setConfirmConfig(prev => ({ ...prev, isOpen: false }));
          navigate('/admin/students');
        } catch (err) {
          toast.error("Failed to delete student: " + err.message);
          setProcessing(false);
        }
      }
    });
  };

  const handleSetupFeePlan = async () => {
    setProcessing(true);
    try {
      const amountPerInst = setupPlanType === 'full' ? setupTotalFee : Math.round(setupTotalFee / setupInstallments);
      
      const { error: planError } = await supabase.from('fee_plans').insert({
        student_id: id,
        course: student.course,
        batch: student.batch,
        total_fee: setupTotalFee,
        plan_type: setupPlanType,
        installment_count: setupPlanType === 'full' ? 1 : setupInstallments
      });

      if (planError) throw planError;

      const paymentRows = [];
      const instCount = setupPlanType === 'full' ? 1 : setupInstallments;

      for (let i = 1; i <= instCount; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + (i - 1));

        paymentRows.push({
          entity_id: id,
          entity_type: 'student',
          installment_number: setupPlanType === 'full' ? null : i,
          total_installments: setupPlanType === 'full' ? null : instCount,
          amount: amountPerInst,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          description: setupPlanType === 'full' ? 'Full Course Fee' : `Installment ${i} of ${instCount}`
        });
      }

      const { error: paymentsError } = await supabase.from('payments').insert(paymentRows);
      if (paymentsError) throw paymentsError;

      toast.success("Fee plan initialized successfully");
      setIsSetupFinanceOpen(false);
      fetchStudentData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Container style={{ textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ color: '#888' }}>Loading Student Profile...</div>
        </Container>
      </AdminLayout>
    );
  }

  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AdminLayout>
      <Container>
        <BackLink to="/admin/students"><FaArrowLeft /> Back to Students</BackLink>
        
        <Layout>
          {/* SIDEBAR CARD */}
          <SidebarCard>
            <ProfileHeader>
              <div className="avatar">{initials}</div>
              <h2>{student.name}</h2>
              <div className="cnic">{student.cnic}</div>
              <StatusBadge $active={student.status === 'Active'}>{student.status}</StatusBadge>
            </ProfileHeader>

            <InfoGrid>
              <InfoRow><span className="label">Phone</span><span className="value">{student.phone}</span></InfoRow>
              <InfoRow><span className="label">Email</span><span className="value">{student.email}</span></InfoRow>
              <InfoRow><span className="label">Course</span><span className="value">{student.course}</span></InfoRow>
              <InfoRow><span className="label">Batch</span><span className="value">{student.batch}</span></InfoRow>
              <InfoRow><span className="label">Timing</span><span className="value">{student.batch_timing || 'N/A'}</span></InfoRow>
              <InfoRow><span className="label">Education</span><span className="value">{student.education}</span></InfoRow>
              <InfoRow><span className="label">Referral</span><span className="value">{student.hear_about_us || 'N/A'}</span></InfoRow>
              <InfoRow><span className="label">Applied</span><span className="value">{new Date(student.submitted_at).toLocaleDateString()}</span></InfoRow>
              <InfoRow><span className="label">Enrolled</span><span className="value">{new Date(student.batch_assigned_at || student.submitted_at).toLocaleDateString()}</span></InfoRow>
            </InfoGrid>

            <ActionButtons>
              <Button className="edit" onClick={() => {
                setEditFormData({
                  name: student.name,
                  phone: student.phone,
                  email: student.email,
                  education: student.education,
                  cnic: student.cnic,
                  course: student.course
                });
                setIsEditProfileOpen(true);
              }}>
                <FaEdit /> Edit Profile
              </Button>
              <Button className="edit" onClick={() => setIsEditBatchOpen(true)}>
                <FaEdit /> Edit Batch
              </Button>
              <Button className="status" $active={student.status === 'Active'} onClick={toggleStatus} disabled={processing}>
                {student.status === 'Active' ? <><FaUserSlash /> Mark as Inactive</> : <><FaCheckCircle /> Mark as Active</>}
              </Button>
              <Button className="revoke" onClick={revokeAccess} disabled={processing}>
                <FaTimesCircle /> Revoke Access
              </Button>
              <Button className="revoke" onClick={handleDeleteStudent} disabled={processing}>
                <FaTrash /> Delete Student
              </Button>
            </ActionButtons>
          </SidebarCard>

          {/* MAIN CONTENT (TABS) */}
          <MainContent>
            <TabContainer>
              <TabBar>
                {['Overview', 'Tasks', 'Attendance', 'Complaints', 'Finance'].map(tab => (
                  <Tab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</Tab>
                ))}
              </TabBar>

              <TabBody>
                {activeTab === 'Overview' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <StatsGrid>
                      <MiniStat><div className="val">85%</div><div className="lab">Attendance</div></MiniStat>
                      <MiniStat><div className="val">{tasks.filter(t => t.submission).length}/{tasks.length}</div><div className="lab">Tasks Done</div></MiniStat>
                      <MiniStat><div className="val">{complaints.filter(c => c.status === 'Open').length}</div><div className="lab">Open Complaints</div></MiniStat>
                    </StatsGrid>
                    
                    <h4 style={{ marginBottom: '20px', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>Recent Activity</h4>
                    <ActivityFeed>
                      <ActivityItem>
                        <div className="dot" />
                        <div className="content">
                          <div className="text">Batch updated to {student.batch}</div>
                          <div className="time">{new Date(student.batch_assigned_at || student.submitted_at).toLocaleString()}</div>
                        </div>
                      </ActivityItem>
                      {tasks.filter(t => t.submission).slice(0, 3).map((t, i) => (
                        <ActivityItem key={i}>
                          <div className="dot" />
                          <div className="content">
                            <div className="text">Submitted task: {t.title}</div>
                            <div className="time">{new Date(t.submission.submitted_at).toLocaleString()}</div>
                          </div>
                        </ActivityItem>
                      ))}
                    </ActivityFeed>
                  </motion.div>
                )}

                {activeTab === 'Tasks' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ background: '#0a0a0a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ textAlign: 'left', color: '#666', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '15px' }}>Task Title</th>
                            <th style={{ padding: '15px' }}>Category</th>
                            <th style={{ padding: '15px' }}>Due Date</th>
                            <th style={{ padding: '15px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map(t => (
                            <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '15px' }}>{t.title}</td>
                              <td style={{ padding: '15px' }}>{t.category}</td>
                              <td style={{ padding: '15px' }}>{new Date(t.due_date).toLocaleDateString()}</td>
                              <td style={{ padding: '15px' }}>
                                <StatusBadge $active={t.submission}>{t.submission ? 'Submitted' : 'Pending'}</StatusBadge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'Attendance' && (
                  <div style={{ textAlign: 'center', padding: '50px 0', color: '#555' }}>
                    <FaCalendarAlt size={40} style={{ marginBottom: '15px' }} />
                    <p>Attendance records for this batch are currently being synchronized.</p>
                  </div>
                )}

                {activeTab === 'Complaints' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {complaints.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px 0', color: '#555' }}>No complaints raised by this student.</div>
                    ) : (
                      <ActivityFeed>
                        {complaints.map(c => (
                          <div key={c.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <span style={{ fontWeight: '600' }}>{c.subject}</span>
                              <StatusBadge $active={c.status === 'Closed'}>{c.status}</StatusBadge>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Category: {c.category} | Opened: {new Date(c.created_at).toLocaleDateString()}</div>
                          </div>
                        ))}
                      </ActivityFeed>
                    )}
                  </motion.div>
                )}

                {activeTab === 'Finance' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {!finance.plan ? (
                      <div style={{ textAlign: 'center', padding: '50px 0', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '15px' }}>
                        <FaDollarSign size={40} style={{ color: '#555', marginBottom: '15px' }} />
                        <h3 style={{ marginBottom: '10px' }}>No Fee Plan Initialized</h3>
                        <p style={{ color: '#666', marginBottom: '25px' }}>This student does not have an active finance record yet.</p>
                        <SubmitBtn style={{ width: '250px', margin: '0 auto' }} onClick={() => setIsSetupFinanceOpen(true)}>
                          Initialize Fee Plan
                        </SubmitBtn>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <StatsGrid style={{ flex: 1, marginBottom: 0 }}>
                            <MiniStat><div className="val">Rs. {finance.totalFee.toLocaleString()}</div><div className="lab">Total Fee</div></MiniStat>
                            <MiniStat><div className="val" style={{ color: '#2ecc71' }}>Rs. {finance.paid.toLocaleString()}</div><div className="lab">Paid</div></MiniStat>
                            <MiniStat><div className="val" style={{ color: '#e74c3c' }}>Rs. {(finance.totalFee - finance.paid).toLocaleString()}</div><div className="lab">Outstanding</div></MiniStat>
                          </StatsGrid>
                        </div>
                        <h4 style={{ marginBottom: '20px', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>Payment Schedule & History</h4>
                        <div style={{ background: '#0a0a0a', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                              <tr style={{ textAlign: 'left', color: '#666', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '15px' }}>Description</th>
                                <th style={{ padding: '15px' }}>Amount</th>
                                <th style={{ padding: '15px' }}>Due Date</th>
                                <th style={{ padding: '15px' }}>Paid Date</th>
                                <th style={{ padding: '15px' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {finance.payments.map(p => (
                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  <td style={{ padding: '15px' }}>{p.description}</td>
                                  <td style={{ padding: '15px', fontWeight: '700' }}>Rs. {p.amount.toLocaleString()}</td>
                                  <td style={{ padding: '15px' }}>{p.due_date}</td>
                                  <td style={{ padding: '15px' }}>{p.paid_date || '—'}</td>
                                  <td style={{ padding: '15px' }}>
                                    <StatusBadge $active={p.status === 'paid'}>{p.status}</StatusBadge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </TabBody>
            </TabContainer>
          </MainContent>
        </Layout>
      </Container>

      {/* MODALS */}
      <AnimatePresence>
        {isPaymentOpen && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ y: 20 }} animate={{ y: 0 }}>
              <ModalHeader>
                <h3>Add Payment Record</h3>
                <button onClick={() => setIsPaymentOpen(false)}><FaTimes /></button>
              </ModalHeader>
              <FormGroup>
                <label>Amount (PKR)</label>
                <input type="number" placeholder="e.g. 5000" />
              </FormGroup>
              <FormGroup>
                <label>Payment Method</label>
                <select>
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>EasyPaisa / JazzCash</option>
                </select>
              </FormGroup>
              <FormGroup>
                <label>Reference #</label>
                <input type="text" placeholder="TXN-123456" />
              </FormGroup>
              <SubmitBtn onClick={() => { toast.success("Payment added successfully"); setIsPaymentOpen(false); }}>Record Payment</SubmitBtn>
            </ModalContent>
          </ModalOverlay>
        )}

        {isEditProfileOpen && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ y: 20 }} animate={{ y: 0 }}>
              <ModalHeader>
                <h3>Edit Student Profile</h3>
                <button onClick={() => setIsEditProfileOpen(false)}><FaTimes /></button>
              </ModalHeader>
              <FormGroup>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={editFormData.name} 
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <label>CNIC</label>
                <input 
                  type="text" 
                  value={editFormData.cnic} 
                  onChange={(e) => setEditFormData({...editFormData, cnic: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={editFormData.phone} 
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={editFormData.email} 
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <label>Course</label>
                <input 
                  type="text" 
                  value={editFormData.course} 
                  onChange={(e) => setEditFormData({...editFormData, course: e.target.value})} 
                />
              </FormGroup>
              <FormGroup>
                <label>Education</label>
                <input 
                  type="text" 
                  value={editFormData.education} 
                  onChange={(e) => setEditFormData({...editFormData, education: e.target.value})} 
                />
              </FormGroup>

              <SubmitBtn onClick={handleUpdateProfile} disabled={processing}>
                {processing ? 'Saving...' : 'Save Changes'}
              </SubmitBtn>
            </ModalContent>
          </ModalOverlay>
        )}

        {isEditBatchOpen && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ y: 20 }} animate={{ y: 0 }}>
              <ModalHeader>
                <h3>Update Student Batch</h3>
                <button onClick={() => setIsEditBatchOpen(false)}><FaTimes /></button>
              </ModalHeader>
              <FormGroup>
                <label>Batch</label>
                <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
                  {availableBatches.length > 0 ? (
                    availableBatches.map(b => (
                      <option key={b.id} value={b.batch_name}>
                        {b.batch_name} ({b.batch_timing})
                      </option>
                    ))
                  ) : (
                    <option disabled>No batches available for this course</option>
                  )}
                </select>
              </FormGroup>
              <SubmitBtn onClick={handleUpdateBatch} disabled={processing}>
                {processing ? "Updating..." : "Update Batch"}
              </SubmitBtn>
            </ModalContent>
          </ModalOverlay>
        )}

        <ConfirmModal 
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          processing={processing}
          onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmConfig.onConfirm}
        />
        {isSetupFinanceOpen && (
          <ModalOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModalContent initial={{ y: 20 }} animate={{ y: 0 }}>
              <ModalHeader>
                <h3>Initialize Fee Plan</h3>
                <button onClick={() => setIsSetupFinanceOpen(false)}><FaTimes /></button>
              </ModalHeader>
              <FormGroup>
                <label>Total Course Fee (Rs.)</label>
                <input 
                  type="number" 
                  value={setupTotalFee} 
                  onChange={(e) => setSetupTotalFee(parseInt(e.target.value))}
                />
              </FormGroup>
              <FormGroup>
                <label>Payment Plan</label>
                <select value={setupPlanType} onChange={(e) => setSetupPlanType(e.target.value)}>
                  <option value="installment">Installment Plan</option>
                  <option value="full">One-time Full Payment</option>
                </select>
              </FormGroup>
              {setupPlanType === 'installment' && (
                <FormGroup>
                  <label>Installments</label>
                  <select value={setupInstallments} onChange={(e) => setSetupInstallments(parseInt(e.target.value))}>
                    {[2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} Months</option>)}
                  </select>
                </FormGroup>
              )}
              <SubmitBtn onClick={handleSetupFeePlan} disabled={processing}>
                {processing ? "Initializing..." : "Create Fee Plan"}
              </SubmitBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default StudentProfile;
