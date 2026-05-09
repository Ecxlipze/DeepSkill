import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';
import AdminLayout from '../components/AdminLayout';

const Container = styled.div`
  padding: 100px 40px 40px;
  color: #fff;
  background: #000;
  min-height: 100vh;
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

const TextArea = styled.textarea`
  padding: 10px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  grid-column: span 2;
  min-height: 80px;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: #111;
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const ImagePreview = styled.img`
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
  background: #222;
`;

const ActionBtn = styled.button`
  background: none;
  border: 1px solid ${props => props.$delete ? '#ff4d4d' : '#4da6ff'};
  color: ${props => props.$delete ? '#ff4d4d' : '#4da6ff'};
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin: 5px;
  &:hover { 
    background: ${props => props.$delete ? '#ff4d4d' : '#4da6ff'}; 
    color: #fff; 
  }
`;

const InstructorManager = () => {
  const [instructors, setInstructors] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image_url: '',
    bio: ''
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    const { data, error } = await supabase.from('instructors').select('*');
    if (error) console.error(error);
    else setInstructors(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('instructors').update(formData).eq('id', editingId);
      if (error) alert(error.message);
      else {
        setFormData({ name: '', role: '', image_url: '', bio: '' });
        setEditingId(null);
        fetchInstructors();
      }
    } else {
      const { error } = await supabase.from('instructors').insert([formData]);
      if (error) alert(error.message);
      else {
        setFormData({ name: '', role: '', image_url: '', bio: '' });
        fetchInstructors();
      }
    }
  };

  const handleEdit = (inst) => {
    setEditingId(inst.id);
    setFormData({
      name: inst.name || '',
      role: inst.role || '',
      image_url: inst.image_url || '',
      bio: inst.bio || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this instructor?')) return;
    const { error } = await supabase.from('instructors').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchInstructors();
  };

  return (
    <Container>
      <Header>
        <h1>Instructor Manager</h1>
        <button onClick={() => window.location.href = '/admin/dashboard'}>Dashboard</button>
      </Header>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>Name</Label>
          <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        </InputGroup>
        <InputGroup>
          <Label>Role (e.g. Web Developer)</Label>
          <Input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
        </InputGroup>
        <InputGroup style={{ gridColumn: 'span 2' }}>
          <Label>Image URL (from Media Library)</Label>
          <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
        </InputGroup>
        <TextArea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Biography / Experience text..." />
        <Button type="submit">{editingId ? 'Update Instructor' : 'Add Instructor'}</Button>
        {editingId && (
          <Button 
            type="button" 
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', role: '', image_url: '', bio: '' });
            }}
            style={{ background: '#444' }}
          >
            Cancel Edit
          </Button>
        )}
      </Form>

      <Grid>
        {instructors.map(inst => (
          <Card key={inst.id}>
            <ImagePreview src={inst.image_url || 'https://via.placeholder.com/150'} />
            <h4>{inst.name}</h4>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>{inst.role}</p>
            <div>
              <ActionBtn onClick={() => handleEdit(inst)}>Edit</ActionBtn>
              <ActionBtn $delete onClick={() => handleDelete(inst.id)}>Delete</ActionBtn>
            </div>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

const InstructorManagerPage = () => <AdminLayout><InstructorManager /></AdminLayout>;
export { InstructorManager };
export default InstructorManagerPage;
