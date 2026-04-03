import React from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import wpressBg from '../assets/wpress-bg.png';
import wpCard from '../assets/wp-card.svg';

const HeroSection = styled.section`
  width: 100%;
  min-height: 80vh;
  background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${wpressBg});
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 90px 40px 40px;
  position: relative;
  overflow: hidden;

  /* Spotlight effect overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at ${props => props.$mouseX}px ${props => props.$mouseY}px,
      rgba(60, 145, 255, 0.12) 0%,
      transparent 50%
    );
    pointer-events: none;
    z-index: 1;
  }

  @media (max-width: 968px) {
    padding: 90px 20px 20px;
    &::before { display: none; }
  }
`;

const FloatingShape = styled(motion.div)`
  position: absolute;
  width: ${props => props.size || '300px'};
  height: ${props => props.size || '300px'};
  border-radius: 50%;
  background: ${props => props.color || 'rgba(60, 145, 255, 0.05)'};
  z-index: 1;
  pointer-events: none;
  filter: blur(60px);
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  width: 100%;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 60px;
  align-items: center;
  z-index: 2;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const TextColumn = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const Heading = styled.h1`
  font-size: 2.7rem;
  font-weight: 800;
  line-height: 1.15;
  color: #fff;
  margin: 0;

  .highlight {
    color: #8CC7FF; 
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Tagline = styled.p`
  font-size: 1.4rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const Description = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  max-width: 700px;
  margin: 0;

  strong {
    color: #fff;
    font-weight: 700;
  }

  span.underlined {
    position: relative;
    display: inline-block;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #275D8F;
      opacity: 0.8;
    }
  }
`;

const StartButton = styled(motion.button)`
  background: #275D8F;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 18px 50px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  width: fit-content;
  transition: all 0.3s ease;
`;

const CardColumn = styled.div`
  display: flex;
  justify-content: center;
  perspective: 1000px;
`;

const EnrollCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  max-width: 450px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  position: relative;
  transform-style: preserve-3d;

  /* Shine overlay */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(60, 145, 255, 0.05) 45%,
      rgba(60, 145, 255, 0.2) 50%,
      rgba(60, 145, 255, 0.05) 55%,
      transparent 60%
    );
    z-index: 2;
    pointer-events: none;
    background-size: 200% 200%;
    background-position: 200% 0;
    transition: background-position 0s;
  }

  &:hover::after {
    background-position: -200% 0;
    transition: background-position 1s ease;
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const CardContent = styled.div`
  padding: 24px;
  color: #000;
`;

const CreatorText = styled.p`
  font-size: 0.8rem;
  color: #666;
  font-weight: 700;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333;

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #7B1F2E;
    flex-shrink: 0;
  }
`;

const EnrollButton = styled(motion.button)`
  width: 100%;
  padding: 14px;
  background-color: #7B1F2E;
  color: #fff;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(123, 31, 46, 0.3);

  &:hover {
    background-color: #9b283b;
    box-shadow: 0 6px 15px rgba(123, 31, 46, 0.4);
  }
`;

const AddedBenefit = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #7B1F2E;
  }
`;

const WordPressHero = () => {
  const { user, enrollCourse } = useAuth();
  const navigate = useNavigate();
  const [spotlightPos, setSpotlightPos] = React.useState({ x: 0, y: 0 });
  
  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    // Spotlight Logic
    setSpotlightPos({ x: e.clientX, y: e.clientY });

    // Tilt Logic (for the card column)
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
    } else {
      enrollCourse({
        id: 'wordpress-mastery',
        title: 'WordPress Mastery',
        iconType: 'wordpress'
      });
      navigate('/dashboard');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <HeroSection 
      onMouseMove={handleMouseMove}
      $mouseX={spotlightPos.x}
      $mouseY={spotlightPos.y}
    >
      <FloatingShape 
        size="450px" 
        color="rgba(60, 145, 255, 0.08)" 
        style={{ top: '-10%', left: '-5%' }} 
        animate={{ 
          x: [0, 40, 0], 
          y: [0, 50, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <FloatingShape 
        size="350px" 
        color="rgba(60, 145, 255, 0.06)" 
        style={{ bottom: '10%', right: '5%' }} 
        animate={{ 
          x: [0, -30, 0], 
          y: [0, -40, 0],
          scale: [1, 1.15, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      <ContentWrapper>
        <TextColumn
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Heading>
              <span className="highlight">WordPress</span> Website Development
              <div>with <span className="highlight">Elementor</span></div>
            </Heading>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Tagline>Build Professional Websites Without Heavy Coding</Tagline>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            style={{ height: '1px', background: 'rgba(60, 145, 255, 0.2)', width: '100%', maxWidth: '500px' }} 
          />

          <motion.div variants={itemVariants}>
            <Description>
              Not everyone wants to start with complex programming, and that's perfectly fine. <strong>WordPress powers over 40% of the web,</strong> and Elementor has made professional website creation faster, smarter, and more accessible than ever. This course is designed for students who want to design, build, and launch real websites using a no-code approach, with just enough technical understanding to work confidently with clients and businesses.
            </Description>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StartButton
              whileHover={{ scale: 1.05, boxShadow: "0 15px 35px rgba(60, 145, 255, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnroll}
            >
              Start Learning
            </StartButton>
          </motion.div>
        </TextColumn>

        <CardColumn>
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: 90 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 80 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <EnrollCard
              style={{ rotateX, rotateY }}
            >
              <CardImage src={wpCard} alt="WordPress Mastery" />
              <CardContent>
                <CreatorText>Created by: DEEPSKILLS</CreatorText>
                <FeatureList>
                  <FeatureItem>JOIN</FeatureItem>
                  <FeatureItem>LEARN</FeatureItem>
                  <FeatureItem>GET EXPERIENCE FROM REAL-TIME PROJECTS</FeatureItem>
                </FeatureList>
                <EnrollButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnroll}
                >
                  Enroll Now
                </EnrollButton>
                <AddedBenefit>BENEFITS</AddedBenefit>
              </CardContent>
            </EnrollCard>
          </motion.div>
        </CardColumn>
      </ContentWrapper>
    </HeroSection>
  );
};

export default WordPressHero;
