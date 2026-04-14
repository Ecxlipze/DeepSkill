import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const getAccentColor = () => {
    const path = location.pathname;
    if (path.includes('graphic')) return '#9335E8'; // Graphic Design Purple
    if (path.includes('laravel')) return '#03E4FD'; // Laravel Cyan
    if (path.includes('react')) return '#98C04C';   // React Green
    if (path.includes('wordpress')) return '#21759B';// WordPress Blue
    return '#7B1F2E'; // Default Deepskills Red
  };

  const hexToRgba = (hex, alpha) => {
    let rawHex = hex.replace('#', '');
    if (rawHex.length === 3) {
      rawHex = rawHex.split('').map(char => char + char).join('');
    }
    const r = parseInt(rawHex.substring(0, 2), 16);
    const g = parseInt(rawHex.substring(2, 4), 16);
    const b = parseInt(rawHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const accentColor = getAccentColor();
  const hoverColor = hexToRgba(accentColor, 0.4);

  const springConfig = { damping: 20, stiffness: 400 };
  const dotSpringConfig = { damping: 30, stiffness: 1000 };

  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  useEffect(() => {
    // Runtime CSS injection for extremely aggressive cursor hiding on Mac/Safari
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let styleEl = null;

    if (!isMobile) {
      styleEl = document.createElement('style');
      styleEl.innerHTML = `
        *, *::before, *::after, html, body { cursor: none !important; -webkit-cursor: none !important; }
        a, button, input, textarea, select, [role="button"], [class*="Button"] { cursor: none !important; -webkit-cursor: none !important; }
      `;
      document.head.appendChild(styleEl);
    }

    let lastTarget = null;

    const moveMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleHover = (e) => {
      const target = e.target;
      if (target === lastTarget) return;
      lastTarget = target;

      // Aggressive inline style override to ensure no bleeding
      try {
        if (target.style && !isMobile) {
          target.style.setProperty('cursor', 'none', 'important');
        }
      } catch (err) { }

      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer';

      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', moveMouse, { passive: true });
    window.addEventListener('mouseover', handleHover, { passive: true });

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleHover);
      if (styleEl && document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
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
          backgroundColor: isHovering ? hoverColor : accentColor,
        }}
      />
    </>
  );
};

export default CustomCursor;
