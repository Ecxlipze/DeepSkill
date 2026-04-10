import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

import { FaLock, FaShieldAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const ModalCard = styled(motion.div)`
  background: #1a1a1a;
  border: 1px solid rgba(123, 31, 46, 0.3);
  border-radius: 25px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
`;

const IconWrapper = styled.div`
  width: 70px;
  height: 70px;
  background: rgba(123, 31, 46, 0.1);
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 25px;
  font-size: 2rem;
  color: #7B1F2E;
`;

const Title = styled.h2`
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-bottom: 30px;
  font-size: 0.95rem;
  line-height: 1.5;
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
  font-size: 0.85rem;
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
  }
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$error ? '#ff4e4e' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  padding: 14px 15px 14px 45px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    border-color: #7B1F2E;
    background: rgba(255, 255, 255, 0.08);
  }
`;

const SubmitBtn = styled(motion.button)`
  background: #7B1F2E;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: #ff4e4e;
  font-size: 0.85rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SuccessView = styled(motion.div)`
  text-align: center;
  padding: 20px 0;

  h3 { color: #fff; margin-bottom: 10px; }
  p { color: rgba(255, 255, 255, 0.6); }
`;

const ResetPasswordModal = ({ user, isOpen }) => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(user.email, password);
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ModalCard
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {!isSuccess ? (
            <>
              <IconWrapper>
                <FaShieldAlt />
              </IconWrapper>
              <Title>Secure Your Account</Title>
              <Subtitle>
                Please set a permanent password to secure your account and access your dashboard.
              </Subtitle>

              <Form onSubmit={handleSubmit}>
                <InputGroup>
                  <Label>New Password</Label>
                  <InputWrapper>
                    <FaLock />
                    <Input 
                      type="password" 
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      $error={!!error}
                      required
                    />
                  </InputWrapper>
                </InputGroup>

                <InputGroup>
                  <Label>Confirm Password</Label>
                  <InputWrapper>
                    <FaLock />
                    <Input 
                      type="password" 
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      $error={!!error}
                      required
                    />
                  </InputWrapper>
                </InputGroup>

                {error && <ErrorMsg><FaExclamationCircle /> {error}</ErrorMsg>}

                <SubmitBtn
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Saving..." : "Set Password"}
                </SubmitBtn>
              </Form>
            </>
          ) : (
            <SuccessView
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div style={{ fontSize: '4rem', color: '#2ecc71', marginBottom: '20px' }}>
                <FaCheckCircle />
              </div>
              <Title>All Set!</Title>
              <Subtitle>Your password has been updated and your account is now fully secured.</Subtitle>
              <p>Redirecting to dashboard...</p>
            </SuccessView>
          )}
        </ModalCard>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export default ResetPasswordModal;
