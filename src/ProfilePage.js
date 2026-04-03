import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaCamera, 
  FaSave, 
  FaCheckCircle, 
  FaChevronRight,
  FaPaintBrush,
  FaRocket,
  FaCode,
  FaWordpress
} from 'react-icons/fa';

const AvailableSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const AvailableGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const AvailableCard = styled(motion(Link))`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #fff;

  .icon {
    font-size: 1.2rem;
    width: 40px;
    height: 40px;
    background: rgba(123, 31, 46, 0.1);
    color: #7B1F2E;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .info {
    h4 {
      font-size: 0.9rem;
      margin: 0;
    }
    span {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
    }
  }
`;

const PageContainer = styled(motion.div)`
  min-height: 100vh;
  background-color: #000;
  padding: 120px 40px 60px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 100px 20px 40px;
  }
`;

const ContentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 30px;
  padding: 50px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);

  @media (max-width: 480px) {
    padding: 30px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 50px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #7B1F2E 0%, #3a0d14 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  font-weight: 800;
  color: #fff;
  border: 4px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CameraBtn = styled.button`
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  background: #fff;
  color: #7B1F2E;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 5px;
`;

const RoleTag = styled.span`
  background: rgba(123, 31, 46, 0.2);
  color: #ff5f78;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  &.full-width {
    grid-column: span 2;
    @media (max-width: 600px) {
      grid-column: span 1;
    }
  }
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);

  svg {
    color: #7B1F2E;
  }
`;

const Input = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 20px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: #7B1F2E;
    box-shadow: 0 0 15px rgba(123, 31, 46, 0.3);
  }
`;

const TextArea = styled.textarea`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 20px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  outline: none;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: #7B1F2E;
    box-shadow: 0 0 15px rgba(123, 31, 46, 0.3);
  }
`;

const SaveButton = styled(motion.button)`
  grid-column: span 2;
  background: #7B1F2E;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
  box-shadow: 0 10px 20px rgba(123, 31, 46, 0.3);

  @media (max-width: 600px) {
    grid-column: span 1;
  }
`;

const SuccessMsg = styled(motion.div)`
  background: rgba(46, 204, 113, 0.1);
  border-left: 4px solid #2ecc71;
  padding: 15px;
  color: #2ecc71;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 4px;
`;

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || 'Learning never stops at DeepSkill!'
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ContentCard
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Header>
          <AvatarWrapper>
            <Avatar>
              {formData.name.charAt(0).toUpperCase()}
            </Avatar>
            <CameraBtn><FaCamera /></CameraBtn>
          </AvatarWrapper>
          <Title>{user?.name}</Title>
          <RoleTag>{user?.role}</RoleTag>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label><FaUser /> Full Name</Label>
            <Input 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Your Name"
            />
          </InputGroup>

          <InputGroup>
            <Label><FaEnvelope /> Email Address</Label>
            <Input 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="email@example.com"
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
          </InputGroup>

          <InputGroup>
            <Label><FaPhone /> Phone Number</Label>
            <Input 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+1 234 567 890"
            />
          </InputGroup>

          <InputGroup>
            <Label><FaUser /> Bio</Label>
            <Input 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              placeholder="Tell us about yourself"
            />
          </InputGroup>

          <InputGroup className="full-width">
            <Label>Summary</Label>
            <TextArea 
              placeholder="Describe your goals and aspirations..."
            />
          </InputGroup>

          <SaveButton
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaSave /> Save Changes
          </SaveButton>
        </Form>

        <AvailableSection>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Available Courses</h3>
          <AvailableGrid>
            {[
              { id: 'graphic-design', title: 'Graphic Designing', path: '/graphic-design', icon: <FaPaintBrush /> },
              { id: 'laravel-mastery', title: 'Full Stack (Laravel)', path: '/laravel-mastery', icon: <FaRocket /> },
              { id: 'full-stack-react', title: 'Full Stack (React)', path: '/full-stack-react', icon: <FaCode /> },
              { id: 'wordpress-mastery', title: 'WordPress Mastery', path: '/wordpress-mastery', icon: <FaWordpress /> }
            ].filter(c => !user?.enrolledCourses?.some(ec => ec.id === c.id)).map(course => (
              <AvailableCard 
                key={course.id} 
                to={course.path}
                whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.08)' }}
              >
                <div className="icon">{course.icon}</div>
                <div className="info">
                  <h4>{course.title}</h4>
                  <span>Join Now <FaChevronRight size={10} /></span>
                </div>
              </AvailableCard>
            ))}
          </AvailableGrid>
        </AvailableSection>

        <AnimatePresence>
          {isSuccess && (
            <SuccessMsg
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FaCheckCircle /> Profile updated successfully!
            </SuccessMsg>
          )}
        </AnimatePresence>
      </ContentCard>
    </PageContainer>
  );
};

export default ProfilePage;
