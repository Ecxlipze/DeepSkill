import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import AboutUsHero from './AboutUsHero';
import WhyDeepskills from './WhyDeepskills';
import WhatYouLearn from './WhatYouLearn';
import HowWeTeach from './HowWeTeach';
import WhoIsItFor from './WhoIsItFor';
import WhatMakesUsDifferent from './WhatMakesUsDifferent';
import OurVision from './OurVision';
import OurMission from './OurMission';
import ScrollReveal from './ScrollReveal';

const PageContainer = styled.div`
  background-color: #000;
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(123, 31, 46, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(123, 31, 46, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
`;

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageContainer>
      {[...Array(15)].map((_, i) => (
        <Particle
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5 
          }}
          animate={{ 
            y: [null, Math.random() * -100, Math.random() * 100],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ 
            duration: 5 + Math.random() * 10, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
      <AboutUsHero />
      <WhyDeepskills />
      <WhatYouLearn />
      <HowWeTeach />
      <WhoIsItFor />
      <WhatMakesUsDifferent />
      <ScrollReveal>
        <OurVision />
      </ScrollReveal>
      <ScrollReveal>
        <OurMission />
      </ScrollReveal>
    </PageContainer>
  );
};

export default AboutPage;
