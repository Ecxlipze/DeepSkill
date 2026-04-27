import React from 'react';
import styled from 'styled-components';
import AdminLayout from '../components/AdminLayout';

const PlaceholderPage = ({ title, icon }) => (
  <AdminLayout>
    <Container>
      <Emoji>{icon}</Emoji>
      <h1>{title}</h1>
      <p>Coming soon — this section is being built.</p>
    </Container>
  </AdminLayout>
);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #111318;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  padding: 40px;

  h1 { color: #fff; margin: 20px 0 10px; font-size: 1.8rem; }
  p { color: #6b7280; font-size: 1.1rem; }
`;

const Emoji = styled.div`
  font-size: 4rem;
`;

export const AdminStudents = () => <PlaceholderPage title="Students Management" icon="👥" />;
export const AdminAttendance = () => <PlaceholderPage title="Attendance System" icon="📋" />;
export const AdminAnnouncements = () => <PlaceholderPage title="Announcements" icon="📢" />;
export const AdminFinance = () => <PlaceholderPage title="Finance Overview" icon="💰" />;
export const AdminFinanceTransactions = () => <PlaceholderPage title="Transactions" icon="💸" />;
export const AdminReferral = () => <PlaceholderPage title="Referral Program" icon="🔗" />;
export const AdminReports = () => <PlaceholderPage title="System Reports" icon="📊" />;
