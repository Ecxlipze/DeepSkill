import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CursorWrapper = styled(motion.div)`
  position: fixed;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  border: 2px solid #fff;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s ease;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CursorDot = styled(motion.div)`
  position: fixed;
  left: 0;
  top: 0;
  width: 8px;
  height: 8px;
  background-color: #7B1F2E;
  border-radius: 50%;
  pointer-events: none;
  z-index: 10000;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 250 };
  const dotSpringConfig = { damping: 40, stiffness: 800 };

  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  useEffect(() => {
    const moveMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleHover = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseover', handleHover);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleHover);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      <CursorWrapper
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          borderWidth: isHovering ? '1px' : '2px',
          opacity: 1
        }}
      />
      <CursorDot
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 4 : 1,
          backgroundColor: isHovering ? 'rgba(123, 31, 46, 0.4)' : '#7B1F2E',
        }}
      />
    </>
  );
};

export default CustomCursor;
