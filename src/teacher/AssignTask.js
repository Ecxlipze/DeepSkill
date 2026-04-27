import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { supabase } from '../supabaseClient';
import { 
  FaHome, FaTasks, FaExclamationCircle, 
  FaWallet, FaUserFriends
} from 'react-icons/fa';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Card = styled(motion.div)`
  background: #111;
  border-radius: 12px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  color: #fff;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 15px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;

  label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    font-weight: 500;
  }

  input, select, textarea {
    padding: 12px 15px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: #0a0a0a;
    color: #fff;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: #7B1F2E;
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const SubmitBtn = styled.button`
  background: #7B1F2E;
  color: #fff;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: #9c273a;
  }
  
  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
`;

const Toast = styled(motion.div)`
  background: #4caf50;
  color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
`;

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

const AssignTask = () => {
  const { user } = useAuth();
  const { addTask } = useTasks();
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Assignment',
    description: '',
    dueDate: '',
    course: user?.assigned_course || 'Web Development Bootcamp',
    batch: user?.batch || 'Batch 12',
    file: null
  });

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('title');
    if (data) setCourses(data);
  };

  const fetchBatches = async () => {
    const { data } = await supabase.from('batches').select('*').eq('status', 'Active');
    if (data) setBatches(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create new task object
    const newTask = {
      title: formData.title,
      category: formData.category,
      description: formData.description,
      dueDate: formData.dueDate,
      course: formData.course,
      batch: formData.batch,
      file: formData.file,
      assignedBy: user?.name || "Teacher"
    };

    await addTask(newTask);

    setIsSubmitting(false);
    setShowToast(true);
    
    // Reset file input by unmounting/remounting or just resetting state
    setFormData({
      ...formData,
      title: '',
      description: '',
      file: null,
      dueDate: ''
    });
    
    // Quick hack to reset the uncontrolled file input visually
    const fileInput = document.getElementById('taskFileInput');
    if (fileInput) fileInput.value = '';

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <DashboardLayout navItems={navItems}>
      <Container>
        {showToast && (
          <Toast initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            Task assigned successfully!
          </Toast>
        )}
        
        <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Title>Assign New Task</Title>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Task Title *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Build a responsive navbar"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </FormGroup>

            <Row>
              <FormGroup>
                <label>Task Category *</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Project">Project</option>
                  <option value="Practice">Practice</option>
                  <option value="Other">Other</option>
                </select>
              </FormGroup>

              <FormGroup>
                <label>Due Date *</label>
                <input 
                  type="date" 
                  required 
                  min={getTodayString()}
                  value={formData.dueDate}
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
              </FormGroup>
            </Row>

            <Row>
              <FormGroup>
                <label>Select Course *</label>
                <select 
                  value={formData.course}
                  onChange={e => setFormData({...formData, course: e.target.value, batch: ''})}
                >
                  <option value="">Select Course</option>
                  {courses.map((c, i) => (
                    <option key={i} value={c.title}>{c.title}</option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup>
                <label>Select Batch *</label>
                <select 
                  value={formData.batch}
                  onChange={e => setFormData({...formData, batch: e.target.value})}
                  disabled={!formData.course}
                >
                  <option value="">Select Batch</option>
                  {batches
                    .filter(b => b.course === formData.course)
                    .map((b, i) => (
                    <option key={i} value={b.batch_name}>{b.batch_name}</option>
                  ))}
                </select>
              </FormGroup>
            </Row>

            <FormGroup>
              <label>Description *</label>
              <textarea 
                required 
                placeholder="Provide clear instructions for the students..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </FormGroup>

            <FormGroup>
              <label>Task File (Optional)</label>
              <input 
                id="taskFileInput"
                type="file" 
                accept=".pdf,.doc,.docx,.png,.jpg,.zip"
                onChange={e => setFormData({...formData, file: e.target.files[0] || null})}
              />
              <span style={{ fontSize: '0.8rem', color: '#666' }}>Max 10MB (PDF, DOC, DOCX, PNG, JPG, ZIP)</span>
            </FormGroup>

            <SubmitBtn type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading & Assigning...' : 'Assign Task'}
            </SubmitBtn>
          </Form>
        </Card>
      </Container>
    </DashboardLayout>
  );
};

export default AssignTask;
