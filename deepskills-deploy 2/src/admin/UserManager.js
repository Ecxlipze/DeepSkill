import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import AdminLayout from '../components/AdminLayout';

const Container = styled.div`
  padding: 10px 0;
  color: #fff;
  background: transparent;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
`;

const BackBtn = styled.button`
  padding: 8px 15px;
  background: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  &:hover { background: #444; }
`;

const Form = styled.form`
  background: #111;
  padding: 25px;
  border-radius: 10px;
  margin-bottom: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
  
  label { font-size: 0.9rem; color: #ccc; }
  input, select {
    padding: 12px;
    background: #222;
    border: 1px solid #333;
    color: #fff;
    border-radius: 6px;
    outline: none;
    &:focus { border-color: #7B1F2E; }
  }
`;

const SubmitBtn = styled.button`
  padding: 12px 24px;
  background: #7B1F2E;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  height: 45px;
  &:hover { background: #9b283b; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #111;
  border-radius: 10px;
  overflow: hidden;

  th, td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #222;
  }

  th {
    background: #1a1a1a;
    color: #888;
    font-weight: 600;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const DeleteBtn = styled.button`
  padding: 6px 12px;
  background: rgba(255, 78, 78, 0.1);
  color: #ff4e4e;
  border: 1px solid #ff4e4e;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #ff4e4e; color: #fff; }
`;

const formatCNIC = (value) => {
  const cnic = value.replace(/\D/g, '');
  let formatted = cnic;
  if (cnic.length > 5 && cnic.length <= 12) {
    formatted = `${cnic.slice(0, 5)}-${cnic.slice(5)}`;
  } else if (cnic.length > 12) {
    formatted = `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12, 13)}`;
  }
  return formatted;
};

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    role: 'student',
    assigned_course: '',
    batch: ''
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('allowed_cnics').select('*').order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }, []);

  const fetchCourses = useCallback(async () => {
    const { data } = await supabase.from('courses').select('title');
    if (data) setCourses(data);
  }, []);

  const fetchBatches = useCallback(async () => {
    const { data } = await supabase.from('batches').select('*').eq('status', 'Active');
    if (data) setBatches(data);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCourses();
    fetchBatches();
  }, [fetchUsers, fetchCourses, fetchBatches]);

  const handleCnicChange = (e) => {
    setFormData({ ...formData, cnic: formatCNIC(e.target.value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.cnic.length !== 15) {
      alert('Please enter a valid 13-digit CNIC.');
      return;
    }

    const { error } = await supabase.from('allowed_cnics').insert([formData]);
    
    if (error) {
      alert(`Error adding user: ${error.message}`);
    } else {
      setFormData({ name: '', cnic: '', role: 'student', assigned_course: '', batch: '' });
      fetchUsers();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this user?')) {
      const { error } = await supabase.from('allowed_cnics').delete().eq('id', id);
      if (!error) fetchUsers();
    }
  };

  return (
    <Container>
      <BackBtn onClick={() => window.location.href = '/admin/dashboard'}>&larr; Back to Dashboard</BackBtn>
      <Header>
        <h2>Student & User Management</h2>
      </Header>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Full Name</label>
          <input 
            type="text" 
            placeholder="e.g. John Doe"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormGroup>
        
        <FormGroup>
          <label>CNIC Number</label>
          <input 
            type="text" 
            placeholder="XXXXX-XXXXXXX-X"
            required
            maxLength="15"
            value={formData.cnic}
            onChange={handleCnicChange}
          />
        </FormGroup>

        <FormGroup>
          <label>Role</label>
          <select 
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </FormGroup>

        <FormGroup>
          <label>Assign Course</label>
          <select 
            value={formData.assigned_course}
            onChange={(e) => setFormData({ ...formData, assigned_course: e.target.value, batch: '' })}
          >
            <option value="">No Course (or General)</option>
            {courses.map((c, idx) => (
              <option key={idx} value={c.title}>{c.title}</option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label>Batch</label>
          <select 
            value={formData.batch}
            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
            disabled={!formData.assigned_course}
          >
            <option value="">Select Batch</option>
            {batches
              .filter(b => b.course === formData.assigned_course)
              .map((b, idx) => (
              <option key={idx} value={b.batch_name}>{b.batch_name} ({b.time_shift})</option>
            ))}
          </select>
        </FormGroup>

        <SubmitBtn type="submit">Add User</SubmitBtn>
      </Form>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>CNIC</th>
              <th>Role</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Added On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No users found</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.cnic}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      background: user.role === 'teacher' ? 'rgba(78, 151, 255, 0.1)' : 'rgba(46, 125, 50, 0.1)',
                      color: user.role === 'teacher' ? '#4e97ff' : '#4caf50'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.assigned_course || '-'}</td>
                  <td>{user.batch || '-'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <DeleteBtn onClick={() => handleDelete(user.id)}>Remove</DeleteBtn>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

const UserManagerPage = () => <AdminLayout><UserManager /></AdminLayout>;
export { UserManager };
export default UserManagerPage;
