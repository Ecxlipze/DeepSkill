import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaBars, FaTimes, FaSignOutAlt, FaChevronDown, FaChevronUp,
  FaHome, FaTasks, FaChartLine, FaCertificate,
  FaExclamationCircle, FaUserPlus, FaComments,
  FaWallet, FaUserFriends, FaGraduationCap, FaCalendarCheck, FaGift,
  FaUserGraduate, FaChalkboardTeacher, FaMoneyBillWave, FaBullhorn, FaIdBadge
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import logoImg from '../logo.svg';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #000;
  color: #fff;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
`;

const SidebarContainer = styled(motion.div)`
  width: 250px;
  background: #0a0a0a;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    box-shadow: 5px 0 15px rgba(0, 0, 0, 0.5);
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  img {
    height: 35px;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavList = styled.div`
  flex: 1;
  padding: 20px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 15px;
  color: ${props => props.$active ? '#fff' : 'rgba(255,255,255,0.6)'};
  background: ${props => props.$active ? 'rgba(123, 31, 46, 0.2)' : 'transparent'};
  border-left: 3px solid ${props => props.$active ? '#7B1F2E' : 'transparent'};
  text-decoration: none;
  border-radius: 0 8px 8px 0;
  transition: all 0.2s ease;
  font-weight: ${props => props.$active ? '600' : '500'};

  &:hover {
    color: #fff;
    background: rgba(123, 31, 46, 0.1);
  }
`;

const NavItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  gap: 12px;
  padding: 12px 15px;
  color: ${props => props.$active ? '#fff' : 'rgba(255,255,255,0.6)'};
  background: ${props => props.$active ? 'rgba(123, 31, 46, 0.2)' : 'transparent'};
  border-left: 3px solid ${props => props.$active ? '#7B1F2E' : 'transparent'};
  border-radius: 0 8px 8px 0;
  transition: all 0.2s ease;
  font-weight: ${props => props.$active ? '600' : '500'};
  cursor: pointer;
  font-family: inherit;
  font-size: 1rem;

  &:hover {
    color: #fff;
    background: rgba(123, 31, 46, 0.1);
  }
`;

const SubNavList = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding-left: 35px;
  overflow: hidden;
`;

const SubNavItem = styled(Link)`
  padding: 8px 10px;
  color: ${props => props.$active ? '#fff' : 'rgba(255,255,255,0.5)'};
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  border-left: 1px solid rgba(255,255,255,0.1);

  &:hover {
    color: #fff;
    border-left-color: #7B1F2E;
  }
  
  ${props => props.$active && `
    border-left-color: #7B1F2E;
  `}
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const TopHeader = styled.div`
  height: 70px;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const MenuToggle = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LogoutBtn = styled.button`
  background: rgba(123, 31, 46, 0.1);
  color: #7B1F2E;
  border: 1px solid rgba(123, 31, 46, 0.2);
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #7B1F2E;
    color: #fff;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background: #000;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavDropdownGroup = ({ item, location, closeSidebar }) => {
  const isAnyChildActive = item.subItems.some(sub => location.pathname === sub.path);
  const [isOpen, setIsOpen] = useState(isAnyChildActive);

  return (
    <>
      <NavItemButton onClick={() => setIsOpen(!isOpen)} $active={isAnyChildActive}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {item.icon} {item.label}
        </div>
        {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
      </NavItemButton>
      <AnimatePresence>
        {isOpen && (
          <SubNavList
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.subItems.map((sub, idx) => (
              <SubNavItem 
                key={idx} 
                to={sub.path} 
                $active={location.pathname === sub.path}
                onClick={closeSidebar}
              >
                {sub.label}
              </SubNavItem>
            ))}
          </SubNavList>
        )}
      </AnimatePresence>
    </>
  );
};

const DashboardLayout = ({ children, navItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fallback navItems based on role if none provided
  const getFallbackNavItems = () => {
    if (!user) return [];
    
    if (user.role === 'student') {
      if (user.status === 'Graduated') {
        return [
          { label: 'Home', path: '/student/dashboard', icon: <FaHome /> },
          { label: 'Progress', path: '/student/progress', icon: <FaChartLine /> },
          { label: 'Certificate', path: '/student/certificate', icon: <FaCertificate /> },
          { label: 'Results (Mid Term)', path: '/student/results/midterm', icon: <FaGraduationCap /> },
          { label: 'Results (Final Term)', path: '/student/results/finalterm', icon: <FaGraduationCap /> },
          { label: 'Finance', path: '/student/finance', icon: <FaWallet /> },
          { label: 'Announcements', path: '/student/announcements', icon: <FaBullhorn /> },
          { label: 'New Enrollment', path: '/student/new-enrollment', icon: <FaUserPlus /> },
          { label: 'Referral Program', path: '/student/referral', icon: <FaUserFriends /> }
        ];
      }

      return [
        { label: 'Home', path: '/student/dashboard', icon: <FaHome /> },
        { label: 'Tasks', path: '/student/tasks', icon: <FaTasks /> },
        { label: 'Progress', path: '/student/progress', icon: <FaChartLine /> },
        { label: 'Attendance', path: '/student/attendance', icon: <FaCalendarCheck /> },
        { label: 'Certificate', path: '/student/certificate', icon: <FaCertificate /> },
        { label: 'Complaints', path: '/student/complaints', icon: <FaExclamationCircle /> },
        { label: 'Announcements', path: '/student/announcements', icon: <FaBullhorn /> },
        { label: 'Results (Mid Term)', path: '/student/results/midterm', icon: <FaGraduationCap /> },
        { label: 'Results (Final Term)', path: '/student/results/finalterm', icon: <FaGraduationCap /> },
        { label: 'New Enrollment', path: '/student/new-enrollment', icon: <FaUserPlus /> },
        { label: 'Group Chat', path: '/student/group-chat', icon: <FaComments /> },
        { label: 'Finance', path: '/student/finance', icon: <FaWallet /> },
        { label: 'Referral Program', path: '/student/referral', icon: <FaUserFriends /> }
      ];
    }
    
    if (user.role === 'teacher') {
      return [
        { label: 'Home', path: '/teacher/dashboard', icon: <FaHome /> },
        { 
          label: 'Tasks', 
          icon: <FaTasks />, 
          subItems: [
            { label: 'Assign Task', path: '/teacher/tasks/assign' },
            { label: 'View Tasks', path: '/teacher/tasks/view' }
          ]
        },
        { label: 'Attendance', path: '/teacher/attendance', icon: <FaCalendarCheck /> },
        { label: 'Complaints', path: '/teacher/complaints', icon: <FaExclamationCircle /> },
        { label: 'Announcements', path: '/teacher/announcements', icon: <FaBullhorn /> },
        {
          label: 'HR',
          icon: <FaIdBadge />,
          subItems: [
            { label: 'My HR Profile', path: '/teacher/hr' }
          ]
        },
        { label: 'Group Chat', path: '/teacher/group-chat', icon: <FaComments /> },
        { label: 'Finance', path: '/teacher/finance', icon: <FaWallet /> },
        { label: 'Referral Program', path: '/teacher/referral', icon: <FaUserFriends /> }
      ];
    }

    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <FaHome /> },
        { label: 'Admissions', path: '/admin/admissions', icon: <FaUserPlus /> },
        { label: 'Students', path: '/admin/students', icon: <FaUserGraduate /> },
        { label: 'Teachers', path: '/admin/teachers', icon: <FaChalkboardTeacher /> },
        { label: 'Attendance', path: '/admin/attendance', icon: <FaCalendarCheck /> },
        { label: 'Complaints', path: '/admin/complaints', icon: <FaExclamationCircle /> },
        { label: 'Certificates', path: '/admin/certificates', icon: <FaCertificate /> },
        { label: 'Finance', path: '/admin/finance', icon: <FaMoneyBillWave /> },
        { label: 'Referral Program', path: '/admin/referral', icon: <FaGift /> },
        { label: 'Exam Results', path: '/admin/results', icon: <FaGraduationCap /> }
      ];
    }
    
    return [];
  };

  const finalNavItems = navItems || getFallbackNavItems();

  return (
    <LayoutContainer>
      <AnimatePresence>
        {sidebarOpen && (
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <SidebarContainer
        initial={false}
        animate={{ 
          x: sidebarOpen || window.innerWidth > 768 ? 0 : '-100%',
          width: window.innerWidth > 768 ? '250px' : '280px'
        }}
        transition={{ type: 'tween', duration: 0.3 }}
      >
        <SidebarHeader>
          <Link to="/">
            <img src={logoImg} alt="DeepSkills" style={{ cursor: 'pointer' }} />
          </Link>
          <CloseBtn onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </CloseBtn>
        </SidebarHeader>
        
        <NavList>
          {finalNavItems.map((item, index) => {
            if (item.subItems) {
              return (
                <NavDropdownGroup 
                  key={index} 
                  item={item} 
                  location={location} 
                  closeSidebar={() => setSidebarOpen(false)} 
                />
              );
            }
            return (
              <NavItem 
                key={index} 
                to={item.path} 
                $active={location.pathname === item.path}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon} {item.label}
              </NavItem>
            );
          })}
        </NavList>
      </SidebarContainer>

      <MainContent>
        <TopHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <MenuToggle onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </MenuToggle>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Dashboard</h2>
          </div>
          
          <UserInfo>
            <LogoutBtn onClick={handleLogout}>
              <FaSignOutAlt />
              <span className="hide-mobile">Logout</span>
            </LogoutBtn>
          </UserInfo>
        </TopHeader>
        
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default DashboardLayout;
