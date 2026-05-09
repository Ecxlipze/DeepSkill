import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaIdCard, FaArrowRight } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';
import { getFirstAccessibleAdminPath } from './utils/permissions';

const PageContainer = styled(motion.div)`
  min-height: 100vh;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 20px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(123, 31, 46, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const GlowingOrb = styled(motion.div)`
  position: absolute;
  width: ${props => props.size || '400px'};
  height: ${props => props.size || '400px'};
  background: ${props => props.color || 'rgba(123, 31, 46, 0.2)'};
  border-radius: 50%;
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  padding: 50px;
  width: 100%;
  max-width: 500px;
  position: relative;
  z-index: 1;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);

  @media (max-width: 480px) {
    padding: 30px;
  }
`;

const Title = styled.h1`
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 10px;
  text-align: center;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-bottom: 40px;
  font-family: 'Inter', sans-serif;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 5px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 15px;
    color: rgba(255, 255, 255, 0.3);
    font-size: 1.1rem;
    transition: color 0.3s ease;
  }

  input:focus + svg {
    color: #7B1F2E;
  }
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 14px 15px 14px 45px;
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

const SubmitButton = styled(motion.button)`
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
  box-shadow: 0 10px 20px rgba(123, 31, 46, 0.3);
  margin-top: 10px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(255, 100, 100, 0.1);
  border-left: 4px solid #ff4e4e;
  padding: 12px;
  color: #ff9999;
  font-size: 0.9rem;
  border-radius: 4px;
`;

const formatCNIC = (value) => {
  const cnic = value.replace(/\D/g, '');
  let formatted = cnic;
  if (cnic.length > 5 && cnic.length <= 12) {
    formatted = `${cnic.slice(0, 5)}-${cnic.slice(5)}`;
  } else if (cnic.length > 12) {
    formatted = `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12, 13)}`;
  }
  return formatted;
};

const LoginPage = () => {
  const [cnic, setCnic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCnicChange = (e) => {
    setCnic(formatCNIC(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (cnic.length !== 15) {
      setError('Please enter a valid 13-digit CNIC.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(cnic);
      
      const from = location.state?.from?.pathname;
      if (from && from !== '/' && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'teacher') {
          navigate('/teacher/dashboard', { replace: true });
        } else if (user.role === 'student') {
          navigate('/student/dashboard', { replace: true });
        } else {
          const adminPath = user.role === 'admin'
            ? '/admin/dashboard'
            : getFirstAccessibleAdminPath(user.permissions || {});
          navigate(adminPath, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Access denied. Please contact your administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <GlowingOrb color="rgba(123, 31, 46, 0.3)" size="500px" style={{ top: '-10%', left: '-10%' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <GlowingOrb color="rgba(123, 31, 46, 0.2)" size="400px" style={{ bottom: '10%', right: '0%' }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <LoginCard
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
      >
        <Title>Welcome Back</Title>
        <Subtitle>Enter your CNIC to access your dashboard</Subtitle>

        <Form onSubmit={handleSubmit}>
          <AnimatePresence>
            {error && (
              <ErrorMessage
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {error}
              </ErrorMessage>
            )}
          </AnimatePresence>

          <InputGroup>
            <Label>CNIC Number</Label>
            <InputWrapper>
              <FaIdCard />
              <Input
                type="text"
                placeholder="XXXXX-XXXXXXX-X"
                required
                value={cnic}
                onChange={handleCnicChange}
                maxLength="15"
              />
            </InputWrapper>
          </InputGroup>

          <SubmitButton
            type="submit"
            disabled={loading || cnic.length !== 15}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Authenticating..." : "Sign In"} <FaArrowRight />
          </SubmitButton>
        </Form>
      </LoginCard>
    </PageContainer>
  );
};

export default LoginPage;
