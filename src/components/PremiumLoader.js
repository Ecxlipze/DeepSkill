import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../logo.svg';

const LoaderOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
`;

const BackgroundGlow = styled(motion.div)`
  position: absolute;
  width: 150%;
  height: 150%;
  background: radial-gradient(
    circle at center,
    rgba(123, 31, 46, 0.15) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  z-index: 0;
  pointer-events: none;
`;

const LogoWrapper = styled(motion.div)`
  width: 320px;
  height: 320px;
  position: relative;
  z-index: 2;
  
  &::after {
    content: '';
    position: absolute;
    // inset: -60px;
    // background: radial-gradient(circle, rgba(123, 31, 46, 0.3) 0%, transparent 70%);
    // border-radius: 50%;
    z-index: -1;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 40px rgba(123, 31, 46, 0.5));
  }
`;

const PremiumLoader = ({ loading }) => {
  return (
    <AnimatePresence>
      {loading && (
        <LoaderOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.15, filter: 'blur(25px)' }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
        >
          <BackgroundGlow
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.6, 0.9, 0.6],
              x: [-30, 30, -30],
              y: [-30, 30, -30]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <LogoWrapper
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <img src={logoImg} alt="DeepSkills Logo" />
          </LogoWrapper>
        </LoaderOverlay>
      )}
    </AnimatePresence>
  );
};

export default PremiumLoader;
