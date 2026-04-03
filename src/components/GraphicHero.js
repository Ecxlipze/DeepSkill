import React from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import graphicsCard from '../assets/graphics-card.svg';

const HeroSection = styled.section`
  width: 100%;
  min-height: 90vh;
  padding: 90px 0 40px;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(128, 0, 128, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.1) 0%, transparent 50%);
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(147, 51, 234, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(147, 51, 234, 0.08) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 40%);
    -webkit-mask-image: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 40%);
    z-index: 1;
    pointer-events: none;
  }
`;

const FloatingCode = styled(motion.div)`
  position: absolute;
  color: rgba(147, 51, 234, 0.12);
  font-family: 'Inter', sans-serif;
  font-weight: 900;
  font-size: ${props => props.size || '3rem'};
  user-select: none;
  pointer-events: none;
  z-index: 2;
  font-style: italic;
`;

const Container = styled.div`
  max-width: 1400px;
  width: 100%;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 2;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 80px;
  }

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const ContentColumn = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Title = styled.h1`
  font-size: 2.7rem;
  font-weight: 800;
  line-height: 1.1;
  color: #fff;
  margin: 0;

  span {
    color: #9333EA;
    // display: block;
    text-shadow: 0 0 30px rgba(147, 51, 234, 0.4);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Tagline = styled.p`
  font-size: 1.15rem;
  color: #fff;
  margin: 0;
  font-weight: 600;
  opacity: 0.9;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  max-width: 800px;
  padding-top: 15px;
  border-top: 1px solid rgba(147, 51, 234, 0.3);

  @media (max-width: 1100px) {
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StartButton = styled(motion.button)`
  background: linear-gradient(90deg, #9333EA 0%, #7E22CE 100%);
  color: #fff;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 18px 45px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  width: fit-content;
  box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
  transition: all 0.3s ease;

  @media (max-width: 1100px) {
    margin: 0 auto;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(147, 51, 234, 0.5);
  }
`;

const CardColumn = styled(motion.div)`
  display: flex;
  justify-content: center;
  perspective: 1000px;
`;

const EnrollCard = styled(motion.div)`
  background: #fff;
  border-radius: 24px;
  overflow: hidden;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  color: #000;
  transform-style: preserve-3d;
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const CardFooter = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CreatorText = styled.p`
  font-size: 0.85rem;
  font-weight: 800;
  color: #666;
  text-transform: uppercase;
  margin: 0;
  
  span {
    color: #444;
  }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: #333;
  font-size: 1rem;

  svg {
    color: #9333EA;
    font-size: 1.2rem;
  }
`;

const EnrollBtn = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #7E22CE;
  color: #fff;
  font-weight: 800;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(126, 34, 206, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: #9333EA;
    transform: translateY(-2px);
  }
`;

const BenefitsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: #333;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 1rem;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    background-color: #9333EA;
    border-radius: 50%;
  }
`;

const GraphicHero = () => {
  const { user, enrollCourse } = useAuth();
  const navigate = useNavigate();
  
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const cardRotateX = useSpring(useTransform(cardY, [-0.5, 0.5], ["10deg", "-10deg"]), { stiffness: 300, damping: 30 });
  const cardRotateY = useSpring(useTransform(cardX, [-0.5, 0.5], ["-10deg", "10deg"]), { stiffness: 300, damping: 30 });

  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPct = x / rect.width - 0.5;
    const yPct = y / rect.height - 0.5;
    cardX.set(xPct);
    cardY.set(yPct);

    e.currentTarget.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    cardX.set(0);
    cardY.set(0);
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/login');
    } else {
      enrollCourse({
        id: 'graphic-design',
        title: 'Graphic Designing',
        iconType: 'design'
      });
      navigate('/dashboard');
    }
  };

  return (
    <HeroSection onMouseMove={handleHeroMouseMove}>
      <FloatingCode size="6rem" style={{ top: '10%', left: '5%', opacity: 0.1 }} animate={{ y: [0, 30, 0] }} transition={{ duration: 8, repeat: Infinity }}>Ps</FloatingCode>
      <FloatingCode size="5rem" style={{ bottom: '20%', left: '10%', opacity: 0.08 }} animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity }}>Ai</FloatingCode>
      <FloatingCode size="4rem" style={{ top: '15%', right: '8%', opacity: 0.1 }} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 6, repeat: Infinity }}>Id</FloatingCode>
      <FloatingCode size="7rem" style={{ bottom: '10%', right: '5%', opacity: 0.05 }} animate={{ x: [0, 40, 0] }} transition={{ duration: 10, repeat: Infinity }}>Pr</FloatingCode>

      <Container>
        <ContentColumn
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Title>
            Professional <span>Graphic Designing</span>
          </Title>
          <Tagline>
            Design Creative Visuals. Build a Strong Portfolio. Launch Your Career in Graphic Design.
          </Tagline>
          <Description>
            This career-focused Graphic Designing program is designed to prepare you for real employment and freelancing opportunities in the creative industry. You will learn how to design professional logos, brand identities, social media creatives, UI designs, and marketing materials used by modern businesses.
            <br /><br />
            From basic design principles to advanced software techniques, this course trains you with practical projects that simulate real client work. Whether you aim for a job, internship, or freelance career, this program prepares you with hands-on experience and a strong portfolio.
          </Description>
          <StartButton
            whileHover={{ scale: 1.05, boxShadow: "0 15px 45px rgba(147, 51, 234, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnroll}
          >
            Start Learning
          </StartButton>
        </ContentColumn>

        <CardColumn
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <EnrollCard
            onMouseLeave={handleMouseLeave}
            style={{ rotateX: cardRotateX, rotateY: cardRotateY }}
          >
            <CardImage src={graphicsCard} alt="Graphic Designing Course" />
            <CardFooter>
              <CreatorText>Created by: DEEPSKILLS</CreatorText>
              <FeatureList>
                <FeatureItem><FaCheckCircle /> Join</FeatureItem>
                <FeatureItem><FaCheckCircle /> Learn</FeatureItem>
                <FeatureItem><FaCheckCircle /> Get Experience from Real-Time Projects</FeatureItem>
              </FeatureList>
              <EnrollBtn onClick={handleEnroll}>Enroll Now</EnrollBtn>
              <BenefitsSection>Benefits</BenefitsSection>
            </CardFooter>
          </EnrollCard>
        </CardColumn>
      </Container>
    </HeroSection>
  );
};

export default GraphicHero;
