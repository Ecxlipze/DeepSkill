import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { 
  FaBookOpen, 
  FaClock, 
  FaChevronRight, 
  FaPlayCircle, 
  FaPaintBrush, 
  FaRocket, 
  FaCode, 
  FaWordpress,
  FaTrashAlt
} from 'react-icons/fa';

const EmptyState = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const AvailableGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const AvailableCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  color: #fff;
  transition: all 0.3s ease;

  .icon {
    font-size: 1.5rem;
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info {
    h4 {
      font-size: 1rem;
      margin-bottom: 5px;
    }
    span {
      font-size: 0.8rem;
      color: #7B1F2E;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
`;

const PageContainer = styled(motion.div)`
  min-height: 100vh;
  background-color: #000;
  padding: 120px 40px 60px;
  color: #fff;
  font-family: 'Inter', sans-serif;

  @media (max-width: 768px) {
    padding: 100px 20px 40px;
  }
`;

const WelcomeSection = styled.div`
  max-width: 1400px;
  margin: 0 auto 40px;
`;

const WelcomeText = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 10px;

  span {
    color: #7B1F2E;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  max-width: 1400px;
  margin: 0 auto 50px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => props.bg || 'rgba(123, 31, 46, 0.1)'};
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: ${props => props.color || '#7B1F2E'};
`;

const StatInfo = styled.div`
  h4 {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 5px;
  }
  p {
    font-size: 1.5rem;
    font-weight: 800;
  }
`;

const MainGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;

  h2 {
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

const CourseGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CourseCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 25px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 25px;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.05);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const CourseIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #111;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #7B1F2E;
  border: 1px solid rgba(123, 31, 46, 0.2);
`;

const CourseDetails = styled.div`
  h3 {
    font-size: 1.2rem;
    margin-bottom: 10px;
  }
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-top: 15px;
  position: relative;
  overflow: hidden;
`;

const ProgressBar = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; bottom: 0;
  background: linear-gradient(90deg, #7B1F2E, #b92e44);
  border-radius: 4px;
`;

const ProgressText = styled.span`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-top: 8px;
`;

const ContinueBtn = styled(motion.button)`
  background: #fff;
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  @media (max-width: 600px) {
    justify-content: center;
  }
`;

const RemoveBtn = styled(motion.button)`
  background: rgba(123, 31, 46, 0.1);
  color: #7B1F2E;
  border: 1px solid rgba(123, 31, 46, 0.2);
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: #7B1F2E;
    color: #fff;
    border-color: #7B1F2E;
    box-shadow: 0 0 15px rgba(123, 31, 46, 0.3);
  }
`;

const DashboardPage = () => {
  const { user, unenrollCourse } = useAuth();

  const getIcon = (type) => {
    switch (type) {
      case 'design': return <FaPaintBrush />;
      case 'laravel': return <FaRocket />;
      case 'react': return <FaCode />;
      case 'wordpress': return <FaWordpress />;
      default: return <FaBookOpen />;
    }
  };


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <PageContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <WelcomeSection>
        <WelcomeText>
          Hello, <span>{user?.name}!</span> 👋
        </WelcomeText>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Keep up the great work. You're making steady progress!</p>
      </WelcomeSection>

      <StatsGrid>
        <StatCard variants={itemVariants} whileHover={{ y: -5 }}>
          <IconWrapper color="#7B1F2E" bg="rgba(123, 31, 46, 0.1)">
            <FaBookOpen />
          </IconWrapper>
          <StatInfo>
            <h4>Courses Enrolled</h4>
            <p>{user?.enrolledCourses?.length || 0}</p>
          </StatInfo>
        </StatCard>

        <StatCard variants={itemVariants} whileHover={{ y: -5 }}>
          <IconWrapper color="#4e97ff" bg="rgba(78, 151, 255, 0.1)">
            <FaClock />
          </IconWrapper>
          <StatInfo>
            <h4>Learning Time</h4>
            <p>{user?.totalLearningTime || '0h'}</p>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <MainGrid>
        <div>
          <SectionHeader>
            <h2>My Courses</h2>
          </SectionHeader>

          <CourseGrid>
            {user?.enrolledCourses && user.enrolledCourses.length > 0 ? (
              user.enrolledCourses.map((course) => (
                <CourseCard key={course.id} variants={itemVariants} whileHover={{ scale: 1.01 }}>
                  <CourseIcon>
                    {getIcon(course.iconType)}
                  </CourseIcon>
                  <CourseDetails>
                    <h3>{course.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Joined on {course.joined}</p>
                    <ProgressBarContainer>
                      <ProgressBar 
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </ProgressBarContainer>
                    <ProgressText>{course.progress}% Completed</ProgressText>
                  </CourseDetails>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
                    <ContinueBtn 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue <FaPlayCircle />
                    </ContinueBtn>

                    <RemoveBtn 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to unenroll from ${course.title}?`)) {
                          unenrollCourse(course.id);
                        }
                      }}
                    >
                     UnEnroll <FaTrashAlt size={14} />
                    </RemoveBtn>
                  </div>
                </CourseCard>
              ))
            ) : (
              <EmptyState
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <StatInfo>
                  <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                    You haven't enrolled in any courses yet.
                  </p>
                  <ContinueBtn as={Link} to="/#courses" style={{ width: 'fit-content', textDecoration: 'none' }}>
                    Explore Courses
                  </ContinueBtn>
                </StatInfo>
              </EmptyState>
            )}
          </CourseGrid>

          {/* Available Courses Section */}
          <div style={{ marginTop: '50px' }}>
            <SectionHeader>
              <h2>Available Courses</h2>
            </SectionHeader>
            <AvailableGrid>
              {[
                { id: 'graphic-design', title: 'Graphic Designing', path: '/graphic-design', iconType: 'design' },
                { id: 'laravel-mastery', title: 'Full Stack (Laravel)', path: '/laravel-mastery', iconType: 'laravel' },
                { id: 'full-stack-react', title: 'Full Stack (React)', path: '/full-stack-react', iconType: 'react' },
                { id: 'wordpress-mastery', title: 'WordPress Mastery', path: '/wordpress-mastery', iconType: 'wordpress' }
              ].filter(c => !user?.enrolledCourses?.some(ec => ec.id === c.id)).map(course => (
                <AvailableCard 
                  key={course.id}
                  as={Link}
                  to={course.path}
                  whileHover={{ y: -5, background: 'rgba(123, 31, 46, 0.1)' }}
                >
                  <div className="icon" style={{ color: '#7B1F2E' }}>
                    {getIcon(course.iconType)}
                  </div>
                  <div className="info">
                    <h4>{course.title}</h4>
                    <span>View Details <FaChevronRight size={10} /></span>
                  </div>
                </AvailableCard>
              ))}
            </AvailableGrid>
          </div>
        </div>
      </MainGrid>
    </PageContainer>
  );
};

export default DashboardPage;
