import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
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

const ModalOverlay = styled(motion.div)`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
`;

const ModalCard = styled(motion.div)`
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8);
`;

const StatusMessage = styled.div`
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  background: ${props => props.$type === 'success' ? 'rgba(46, 125, 50, 0.15)' : 'rgba(198, 40, 40, 0.15)'};
  border-left: 4px solid ${props => props.$type === 'success' ? '#4caf50' : '#f44336'};
  color: ${props => props.$type === 'success' ? '#a5d6a7' : '#ef9a9a'};
  line-height: 1.5;
`;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [resetSuccess, setResetSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const validateResetEmail = (val) => {
    if (!val.trim()) return 'Email is required';
    if (!/^[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)+$/.test(val)) {
      return 'Please enter valid email';
    }
    return '';
  };

  const handleResetEmailChange = (e) => {
    const val = e.target.value;
    setResetEmail(val);
    setResetEmailError(validateResetEmail(val));
  };

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

  const handleCloseModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetEmailError('');
    setResetStatus(null);
    setResetSuccess(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    // Validate before submit
    const emailErr = validateResetEmail(resetEmail);
    if (emailErr) {
      setResetEmailError(emailErr);
      return;
    }

    setResetLoading(true);
    setResetStatus(null);

    try {
      const response = await fetch('/api/forgot-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setResetStatus({
          type: 'success',
          message: 'We have sent a temporary password. Please check your inbox and spam folder.'
        });
        setResetSuccess(true);
      } else {
        setResetStatus({
          type: 'error',
          message: data.message || 'This email is not registered. Please check and try again.'
        });
      }
    } catch (err) {
      setResetStatus({
        type: 'error',
        message: 'Unable to connect to the server. Please try again later.'
      });
    } finally {
      setResetLoading(false);
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

          <ForgotPassword
            as="button"
            type="button"
            onClick={() => setShowResetModal(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Forgot Password?
          </ForgotPassword>

          <SubmitButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Authenticating..." : "Sign In"} <FaArrowRight />
          </SubmitButton>
        </Form>

        <FooterText>
          Don't have an account? <Link to="/register">Get Enrolled</Link>
        </FooterText>
      </LoginCard>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalCard
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <Title style={{ fontSize: '1.8rem' }}>Reset Password</Title>
              <Subtitle>Enter your email address and we'll send you a temporary password to recover your account.</Subtitle>

              <AnimatePresence>
                {resetStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <StatusMessage $type={resetStatus.type}>
                      {resetStatus.message}
                    </StatusMessage>
                  </motion.div>
                )}
              </AnimatePresence>

              <Form onSubmit={handleResetPassword}>
                <InputGroup>
                  <Label>Email Address</Label>
                  <InputWrapper>
                    <FaEnvelope />
                    <Input
                      type="text"
                      placeholder="Enter your registered email"
                      value={resetEmail}
                      onChange={handleResetEmailChange}
                      disabled={resetSuccess}
                      style={resetEmailError ? { borderColor: '#ff4e4e', boxShadow: '0 0 10px rgba(255,78,78,0.2)' } : {}}
                    />
                  </InputWrapper>
                  <AnimatePresence>
                    {resetEmailError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ color: '#ff9999', fontSize: '0.8rem', marginTop: '4px', marginLeft: '5px' }}
                      >
                        {resetEmailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </InputGroup>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <SubmitButton
                    type="button"
                    onClick={handleCloseModal}
                    style={{ background: 'rgba(255,255,255,0.05)', flex: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </SubmitButton>

                  {resetSuccess ? (
                    <SubmitButton
                      type="button"
                      onClick={handleCloseModal}
                      style={{ flex: 1.5, background: '#22c55e' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Login Now <FaArrowRight />
                    </SubmitButton>
                  ) : (
                    <SubmitButton
                      type="submit"
                      disabled={resetLoading || !!resetEmailError}
                      style={{ flex: 1.5 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {resetLoading ? "Sending..." : "Send Password"}
                    </SubmitButton>
                  )}
                </div>
              </Form>
            </ModalCard>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default LoginPage;

