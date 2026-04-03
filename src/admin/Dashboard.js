import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const DashboardContainer = styled.div`
  padding: 100px 30px 40px;
  color: #fff;
  background: #000;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 20px;
`;

const LogoutBtn = styled.button`
  padding: 8px;
  background: #333;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #444; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: #1a1a1a;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
  &:hover { transform: translateY(-5px); }
`;

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin';
  };

  if (!user) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading...</div>;

  return (
    <DashboardContainer>
      <Header>
        <h1>DeepSkill Admin Dashboard</h1>
        <LogoutBtn onClick={handleLogout}>Logout</LogoutBtn>
      </Header>

      <Grid>
        <Card onClick={() => window.location.href = '/admin/courses'}>
          <h3>Manage Courses</h3>
          <p>Add, edit, or remove course content</p>
        </Card>
        <Card onClick={() => window.location.href = '/admin/testimonials'}>
          <h3>Manage Testimonials</h3>
          <p>Upload video reviews and student feedback</p>
        </Card>
        <Card onClick={() => window.location.href = '/admin/media'}>
          <h3>Media Library</h3>
          <p>Upload and manage images/videos</p>
        </Card>
        <Card onClick={() => window.location.href = '/admin/content'}>
          <h3>Site Content</h3>
          <p>Edit About text and site-wide descriptions</p>
        </Card>
        <Card onClick={() => window.location.href = '/admin/instructors'}>
          <h3>Instructors</h3>
          <p>Project teachers and role details</p>
        </Card>
        <Card onClick={() => window.location.href = '/admin/media-page'}>
          <h3>Media Page Content</h3>
          <p>Projects, Awards, and Video tutorials</p>
        </Card>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;
