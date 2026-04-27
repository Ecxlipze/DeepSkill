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

const TextArea = styled.textarea`
  padding: 10px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #fff;
  grid-column: span 2;
  min-height: 100px;
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
  margin-right: 8px;
  &:hover { background: #4da6ff; color: #fff; }
`;

const CourseManager = () => {
  const [courses, setCourses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    image_url: '',
    category: '',
    pdf_url: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) console.error(error);
    else setCourses(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('courses').update(formData).eq('id', editingId);
      if (error) alert(error.message);
      else {
        setFormData({ title: '', description: '', price: '', duration: '', image_url: '', category: '', pdf_url: '' });
        setEditingId(null);
        fetchCourses();
      }
    } else {
      const { error } = await supabase.from('courses').insert([formData]);
      if (error) {
        alert(error.message);
      } else {
        setFormData({ title: '', description: '', price: '', duration: '', image_url: '', category: '', pdf_url: '' });
        fetchCourses();
      }
    }
  };

  const handleEdit = (course) => {
    setEditingId(course.id);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      price: course.price || '',
      duration: course.duration || '',
      image_url: course.image_url || '',
      category: course.category || '',
      pdf_url: course.pdf_url || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchCourses();
  };

  return (
    <Container>
      <Header>
        <h1>Course Manager</h1>
        <button onClick={() => window.location.href = '/admin/dashboard'}>Dashboard</button>
      </Header>

      <Form onSubmit={handleSubmit}>
        <InputGroup>
          <Label>Title</Label>
          <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        </InputGroup>
        <InputGroup>
          <Label>Category</Label>
          <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Web Development" />
        </InputGroup>
        <InputGroup>
          <Label>Price</Label>
          <Input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
        </InputGroup>
        <InputGroup>
          <Label>Duration</Label>
          <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
        </InputGroup>
        <InputGroup style={{ gridColumn: 'span 2' }}>
          <Label>Image URL (from Media Library)</Label>
          <Input value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
        </InputGroup>
        <InputGroup style={{ gridColumn: 'span 2' }}>
          <Label>Course PDF URL (from Media Library)</Label>
          <Input value={formData.pdf_url} onChange={e => setFormData({...formData, pdf_url: e.target.value})} placeholder="Paste PDF URL from Media Library here" />
        </InputGroup>
        <TextArea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description..." />
        <Button type="submit">{editingId ? 'Update Course' : 'Add Course'}</Button>
        {editingId && (
          <Button 
            type="button" 
            onClick={() => {
              setEditingId(null);
              setFormData({ title: '', description: '', price: '', duration: '', image_url: '', category: '', pdf_url: '' });
            }}
            style={{ background: '#444' }}
          >
            Cancel Edit
          </Button>
        )}
      </Form>

      <Table>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <Td>{course.title}</Td>
              <Td>{course.category}</Td>
              <Td>{course.price}</Td>
              <Td>
                <EditBtn onClick={() => handleEdit(course)}>Edit</EditBtn>
                <DeleteBtn onClick={() => handleDelete(course.id)}>Delete</DeleteBtn>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
const CourseManagerPage = () => <AdminLayout><CourseManager /></AdminLayout>;
export { CourseManager };
export default CourseManagerPage;
