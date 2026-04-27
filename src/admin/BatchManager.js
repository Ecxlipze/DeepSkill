import React, { useState, useEffect } from 'react';
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
`;

const Form = styled.form`
  background: #1a1a1a;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #ccc;
`;

const Input = styled.input`
  padding: 10px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
`;

const Select = styled.select`
  padding: 10px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
`;

const Button = styled.button`
  padding: 12px;
  background: #7B1F2E;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  grid-column: span 2;
  &:hover { background: #a0283a; }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #333;
  color: #888;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #222;
`;

const DeleteBtn = styled.button`
  background: none;
  border: 1px solid #ff4d4d;
  color: #ff4d4d;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #ff4d4d; color: #fff; }
`;

const EditBtn = styled.button`
  background: none;
  border: 1px solid #4da6ff;
  color: #4da6ff;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  &:hover { background: #4da6ff; color: #000; }
`;

function BatchManager() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course: '',
    batch_name: 'Batch 1',
    time_shift: 'Morning (9:00 AM - 12:00 PM)',
    status: 'Active'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCourses();
    fetchBatches();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('title');
    if (!error && data) {
      setCourses(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, course: data[0].title }));
      }
    }
  };

  const fetchBatches = async () => {
    const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setBatches(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('batches').update(formData).eq('id', editingId);
      if (error) alert(error.message);
      else {
        setEditingId(null);
        setFormData({ course: courses[0]?.title || '', batch_name: 'Batch 1', time_shift: 'Morning (9:00 AM - 12:00 PM)', status: 'Active' });
        fetchBatches();
      }
    } else {
      const { error } = await supabase.from('batches').insert([formData]);
      if (error) alert(error.message);
      else {
        setFormData({ course: courses[0]?.title || '', batch_name: 'Batch 1', time_shift: 'Morning (9:00 AM - 12:00 PM)', status: 'Active' });
        fetchBatches();
      }
    }
  };

  const handleEdit = (batch) => {
    setEditingId(batch.id);
    setFormData({
      course: batch.course,
      batch_name: batch.batch_name,
      time_shift: batch.time_shift,
      status: batch.status
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this batch?')) return;
    const { error } = await supabase.from('batches').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchBatches();
  };

  return (
    <Container>
      <Header>
        <h1>Batch Manager</h1>
        <button onClick={() => window.location.href = '/admin/dashboard'}>Dashboard</button>
      </Header>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>Course</Label>
          <Select 
            value={formData.course} 
            onChange={e => setFormData({...formData, course: e.target.value})} 
            required
          >
            {courses.map((c, i) => (
              <option key={i} value={c.title}>{c.title}</option>
            ))}
          </Select>
        </InputGroup>
        
        <InputGroup>
          <Label>Batch Name</Label>
          <Select 
            value={formData.batch_name} 
            onChange={e => setFormData({...formData, batch_name: e.target.value})} 
            required 
          >
            {[...Array(20)].map((_, i) => (
              <option key={i} value={`Batch ${i + 1}`}>Batch {i + 1}</option>
            ))}
          </Select>
        </InputGroup>

        <InputGroup>
          <Label>Time Shift</Label>
          <Select 
            value={formData.time_shift} 
            onChange={e => setFormData({...formData, time_shift: e.target.value})} 
            required 
          >
            <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
            <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
            <option value="Evening (6:00 PM - 9:00 PM)">Evening (6:00 PM - 9:00 PM)</option>
            <option value="Weekend (Saturday & Sunday)">Weekend (Saturday & Sunday)</option>
          </Select>
        </InputGroup>

        <InputGroup>
          <Label>Status</Label>
          <Select 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </Select>
        </InputGroup>

        <Button type="submit">{editingId ? 'Update Batch' : 'Create Batch'}</Button>
      </Form>

      <h2>Active Batches</h2>
      <Table>
        <thead>
          <tr>
            <Th>Course</Th>
            <Th>Batch Name</Th>
            <Th>Time Shift</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {batches.map(batch => (
            <tr key={batch.id}>
              <Td>{batch.course}</Td>
              <Td>{batch.batch_name}</Td>
              <Td>{batch.time_shift}</Td>
              <Td>
                <span style={{ color: batch.status === 'Active' ? '#4caf50' : '#f44336' }}>
                  {batch.status}
                </span>
              </Td>
              <Td>
                <EditBtn onClick={() => handleEdit(batch)}>Edit</EditBtn>
                <DeleteBtn onClick={() => handleDelete(batch.id)}>Delete</DeleteBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

const BatchManagerPage = () => <AdminLayout><BatchManager /></AdminLayout>;
export { BatchManager };
export default BatchManagerPage;
