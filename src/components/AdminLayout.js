import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FaHome, FaUserGraduate, FaChalkboardTeacher, FaBook, 
  FaMoneyBillWave, FaLink, FaChartBar, FaCog, FaChevronDown, 
  FaChevronRight, FaBars, FaTimes, FaBell, FaClipboardList,
  FaExclamationCircle, FaBullhorn, FaUserPlus,
  FaGraduationCap, FaPen
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintsContext';
import { buildAdminSidebar } from '../utils/permissions';
import logoImg from '../logo.svg';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({
    courses: location.pathname.includes('/courses'),
    finance: location.pathname.includes('/finance'),
    settings: location.pathname.includes('/settings')
  });

  const hasOpenComplaints = complaints.some(c => c.status === 'Open');

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
  };

  const iconMap = {
    home: <FaHome />,
    admissions: <FaUserPlus />,
    students: <FaUserGraduate />,
    teachers: <FaChalkboardTeacher />,
    hr: <FaClipboardList />,
    users: <FaUserGraduate />,
    courses: <FaBook />,
    attendance: <FaClipboardList />,
    results: <FaGraduationCap />,
    announcements: <FaBullhorn />,
    blog: <FaPen />,
    complaints: <FaExclamationCircle />,
    finance: <FaMoneyBillWave />,
    referral: <FaLink />,
    reports: <FaChartBar />,
    settings: <FaCog />
  };

  const navItems = buildAdminSidebar(user, user?.permissions, hasOpenComplaints).map((item) => {
    if (item.type === 'label') return item;
    if (item.type === 'dropdown') {
      const menuKey = item.label.toLowerCase().includes('user') ? 'users' : item.label.toLowerCase().includes('finance') ? 'finance' : 'settings';
      return {
        ...item,
        icon: iconMap[item.iconKey],
        isOpen: openMenus[menuKey] || location.pathname.startsWith(item.items?.[0]?.path || ''),
        onToggle: () => toggleMenu(menuKey)
      };
    }
    return { ...item, icon: iconMap[item.iconKey] };
  });

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return paths.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
  };

  const getPageTitle = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0) return 'Admin';
    return paths[paths.length - 1].charAt(0).toUpperCase() + paths[paths.length - 1].slice(1);
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
      <Sidebar isOpen={isMobileMenuOpen}>
        <SidebarHeader>
          <LogoBox>
            <img src={logoImg} alt="DeepSkill Admin" />
          </LogoBox>
          <CloseButton onClick={() => setIsMobileMenuOpen(false)}>
            <FaTimes />
          </CloseButton>
        </SidebarHeader>

        <NavList>
          {navItems.map((item, idx) => {
            if (item.type === 'label') {
              return <NavLabel key={`label-${idx}`}>{item.label}</NavLabel>;
            }

            if (item.type === 'dropdown') {
              const isChildActive = item.items.some(child => location.pathname === child.path);
              return (
                <div key={`dropdown-${idx}`}>
                  <NavItem 
                    as="div" 
                    onClick={item.onToggle} 
                    active={isChildActive}
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
                            active={location.pathname === child.path}
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

            return (
              <NavItem 
                key={`nav-${idx}`} 
                to={item.path} 
                active={location.pathname === item.path}
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
              <Breadcrumbs>{getBreadcrumbs()}</Breadcrumbs>
              <PageTitle>{getPageTitle()}</PageTitle>
            </div>
          </div>
          <div className="right">
            <IconButton>
              <FaBell />
              <span className="notif-badge" />
            </IconButton>
            <AvatarCircle onClick={() => navigate('/profile')}>
              {user?.name?.[0] || 'A'}
            </AvatarCircle>
          </div>
        </Topbar>
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
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
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
  color: ${props => props.active ? '#fff' : '#9ca3af'};
  background: ${props => props.active ? '#1f2127' : 'transparent'};
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  gap: 12px;
  font-size: 0.95rem;

  &:hover {
    color: #e5e7eb;
    background: rgba(255, 255, 255, 0.03);
  }

  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 20px;
      width: 3px;
      background: #4F8EF7;
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
  color: ${props => props.active ? '#4F8EF7' : '#9ca3af'};
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
