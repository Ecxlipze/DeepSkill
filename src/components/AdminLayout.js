import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, 
  FaMoneyBillWave, FaLink, FaChartBar, FaCog, FaChevronDown, 
  FaChevronRight, FaBars, FaTimes, FaClipboardList,
  FaExclamationCircle, FaBullhorn, FaUserPlus,
  FaGraduationCap, FaPen, FaHeadset
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { useDepartment } from '../context/DepartmentContext';
import {
  DEPARTMENTS,
  getDepartmentByPath,
  getDepartmentNav,
  getDepartmentTitle,
  normalizeAdminPath
} from '../utils/departments';
import NotificationBell from './NotificationBell';
import logoImg from '../logo.svg';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const { visibleDepartments, activeDepartment, setActiveDepartment } = useDepartment();
  const { complaints } = useComplaints();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    courses: location.pathname.includes('/courses'),
    attendance: location.pathname.includes('/attendance'),
    finance: location.pathname.includes('/finance'),
    settings: location.pathname.includes('/settings')
  });

  const hasOpenComplaints = complaints.some(c => c.status === 'Open');

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const badges = {
    openComplaints: hasOpenComplaints,
    newInquiries: false,
    pendingHR: false,
    pendingPayouts: false
  };
  const normalizedPath = normalizeAdminPath(location.pathname);
  const currentDepartment = getDepartmentByPath(normalizedPath);
  const activeDepartmentMeta = DEPARTMENTS.find((department) => department.id === (currentDepartment?.id || activeDepartment)) || DEPARTMENTS[0];
  const navItems = getDepartmentNav(user, activeDepartmentMeta.id, badges);
  const routeMeta = getDepartmentTitle(normalizedPath);

  const handleDepartmentSwitch = (department) => {
    setActiveDepartment(department.id);
    navigate(department.path);
    setIsMobileMenuOpen(false);
  };

  return (
    <LayoutWrapper>
      {/* Mobile Hamburger Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Overlay 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar $isOpen={isMobileMenuOpen}>
        <SidebarHeader>
          <LogoBox>
            <img src={logoImg} alt="DeepSkill Admin" />
          </LogoBox>
          <CloseButton onClick={() => setIsMobileMenuOpen(false)}>
            <FaTimes />
          </CloseButton>
        </SidebarHeader>

        <DepartmentHeader $color={activeDepartmentMeta.color}>
          <small>Department</small>
          <strong><span>{activeDepartmentMeta.icon}</span> {activeDepartmentMeta.label}</strong>
        </DepartmentHeader>

        <NavList>
          {navItems.map((item, idx) => {
            if (item.section) {
              return <NavLabel key={`label-${idx}`}>{item.section}</NavLabel>;
            }

            if (item.type === 'dropdown') {
              const isChildActive = item.items.some(child => location.pathname === child.path);
              return (
                <div key={`dropdown-${idx}`}>
                  <NavItem 
                    as="div" 
                    onClick={item.onToggle} 
                    $active={isChildActive}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                    <span className="arrow">
                      {item.isOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                    </span>
                  </NavItem>
                  <AnimatePresence>
                    {item.isOpen && (
                      <DropdownContent
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        {item.items.map((child, cIdx) => (
                          <DropdownItem 
                            key={`child-${cIdx}`} 
                            to={child.path}
                            $active={location.pathname === child.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </DropdownItem>
                        ))}
                      </DropdownContent>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = normalizedPath === item.path || normalizedPath.startsWith(`${item.path}/`);
            return (
              <NavItem 
                key={`nav-${idx}`} 
                to={item.path} 
                $active={isActive}
                $accent={activeDepartmentMeta.color}
                $activeBg={activeDepartmentMeta.activeBg}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
                {item.badge && <span className="red-dot" />}
              </NavItem>
            );
          })}
        </NavList>

        <SidebarFooter>
          <UserBadge>
            <Avatar>{user?.name?.[0] || 'A'}</Avatar>
            <div className="info">
              <p>{user?.name || 'Administrator'}</p>
              <span>{user?.email || 'admin@deepskill.com'}</span>
            </div>
          </UserBadge>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <MainArea>
        <Topbar>
          <div className="left">
            <MenuToggle onClick={() => setIsMobileMenuOpen(true)}>
              <FaBars />
            </MenuToggle>
            <div className="breadcrumb-area">
              <Breadcrumbs>{routeMeta.breadcrumbs}</Breadcrumbs>
              <PageTitle>{routeMeta.title}</PageTitle>
            </div>
          </div>
          <div className="right">
            <NotificationBell />
            <AvatarCircle onClick={() => navigate('/profile')}>
              {user?.name?.[0] || 'A'}
            </AvatarCircle>
          </div>
        </Topbar>
        <DepartmentTabs>
          {visibleDepartments.map((department) => {
            const isActive = activeDepartmentMeta.id === department.id;
            return (
              <DeptTab
                key={department.id}
                type="button"
                $active={isActive}
                $color={department.color}
                onClick={() => handleDepartmentSwitch(department)}
              >
                <span className="dot" />
                <span>{department.icon}</span>
                {department.shortLabel || department.label}
              </DeptTab>
            );
          })}
        </DepartmentTabs>
        <ContentArea>
          {children}
        </ContentArea>
      </MainArea>
    </LayoutWrapper>
  );
};

// ----- Styled Components ----- //

const LayoutWrapper = styled.div`
  display: flex;
  height: 100vh;
  background: #000;
  overflow: hidden;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 998;
  backdrop-filter: blur(4px);
`;

const Sidebar = styled.div`
  width: 260px;
  background: #111318;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.3s ease;
  z-index: 999;

  @media (max-width: 768px) {
    position: fixed;
    height: 100%;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  }
`;

const SidebarHeader = styled.div`
  padding: 25px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogoBox = styled.div`
  display: flex;
  align-items: center;
  
  img {
    height: 35px;
    width: auto;
    display: block;
  }
`;

const DepartmentHeader = styled.div`
  margin: 0 16px 12px;
  padding: 14px 16px;
  border: 1px solid ${({ $color }) => `${$color}40`};
  border-radius: 14px;
  background: ${({ $color }) => `${$color}14`};

  small {
    display: block;
    color: #6b7280;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
  }

  strong {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #f9fafb;
    font-size: 0.95rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: none;
  @media (max-width: 768px) { display: block; }
`;

const NavList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
`;

const NavLabel = styled.div`
  padding: 25px 20px 10px;
  font-size: 9px;
  font-weight: 700;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 1.2px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: ${props => props.$active ? '#fff' : '#9ca3af'};
  background: ${props => props.$active ? (props.$activeBg || '#1f2127') : 'transparent'};
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  gap: 12px;
  font-size: 0.95rem;

  &:hover {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.03);
  }

  ${props => props.$active && `
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 20px;
      width: 3px;
      background: ${props.$accent || '#4F8EF7'};
      border-radius: 0 4px 4px 0;
    }
  `}

  .icon { font-size: 1.1rem; }
  .arrow { margin-left: auto; color: #4b5563; }
  
  .red-dot {
    width: 6px;
    height: 6px;
    background: #ef4444;
    border-radius: 50%;
    margin-left: auto;
    box-shadow: 0 0 10px #ef4444;
  }
`;

const DropdownContent = styled(motion.div)`
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 10px 20px 10px 52px;
  color: ${props => props.$active ? '#4F8EF7' : '#9ca3af'};
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.02);
  }
`;

const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  .info {
    p { margin: 0; font-size: 0.85rem; color: #fff; font-weight: 500; }
    span { font-size: 0.7rem; color: #6b7280; }
  }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  background: #1f2127;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4F8EF7;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #000;
`;

const Topbar = styled.div`
  height: 70px;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  position: sticky;
  top: 0;
  z-index: 900;

  @media (max-width: 768px) { padding: 0 20px; }
`;

const DepartmentTabs = styled.div`
  min-height: 50px;
  background: #0a0a0a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 30px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const DeptTab = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid ${({ $active, $color }) => $active ? `${$color}66` : 'rgba(255,255,255,0.07)'};
  background: ${({ $active, $color }) => $active ? `${$color}18` : 'transparent'};
  color: ${({ $active }) => $active ? '#f9fafb' : '#9ca3af'};
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    box-shadow: 0 0 12px ${({ $color }) => $color};
  }

  &:hover {
    color: #fff;
    border-color: ${({ $color }) => `${$color}66`};
  }
`;

const MenuToggle = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  margin-right: 20px;
  display: none;
  @media (max-width: 768px) { display: block; }
`;

const Breadcrumbs = styled.div`
  font-size: 0.7rem;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PageTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  color: #fff;
  font-weight: 600;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.05);
  }

  .notif-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #0a0a0a;
  }
`;

const AvatarCircle = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4F8EF7, #2D5CFE);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
  transition: transform 0.2s;

  &:hover { transform: scale(1.05); }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  
  @media (max-width: 768px) { padding: 20px; }
`;

export default AdminLayout;
