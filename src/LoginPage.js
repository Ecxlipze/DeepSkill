import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight, FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from './context/AuthContext';

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

const ForgotPassword = styled.a`
  color: #7B1F2E;
  font-size: 0.85rem;
  text-align: right;
  text-decoration: none;
  font-weight: 600;
  margin-top: -10px;

  &:hover {
    text-decoration: underline;
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
  color: rgba(255, 255, 255, 0.2);
  font-size: 0.85rem;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SocialGroup = styled.div`
  display: flex;
  gap: 15px;
`;

const SocialButton = styled(motion.button)`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  margin-top: 30px;
  font-size: 0.95rem;

  a {
    color: #7B1F2E;
    text-decoration: none;
    font-weight: 700;

    &:hover {
      text-decoration: underline;
    }
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

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid email or password. Please try again.');
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
        <Subtitle>Enter your details to access your account</Subtitle>

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
            <Label>Email Address</Label>
            <InputWrapper>
              <FaEnvelope />
              <Input 
                type="email" 
                placeholder="john@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <InputWrapper>
              <FaLock />
              <Input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </InputWrapper>
          </InputGroup>

          <ForgotPassword href="#">Forgot Password?</ForgotPassword>

          <SubmitButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Authenticating..." : "Sign In"} <FaArrowRight />
          </SubmitButton>
        </Form>

        <Divider>or continue with</Divider>

        <SocialGroup>
          <SocialButton whileHover={{ y: -3 }}>
            <FaGoogle /> Google
          </SocialButton>
          <SocialButton whileHover={{ y: -3 }}>
            <FaGithub /> Github
          </SocialButton>
        </SocialGroup>

        <FooterText>
          Don't have an account? <Link to="/register">Join Now</Link>
        </FooterText>
      </LoginCard>
    </PageContainer>
  );
};

export default LoginPage;
