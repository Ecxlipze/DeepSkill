import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import footerBg from '../assets/footer-bg.png';

const Section = styled.section`
  width: 100%;
  padding: 40px 0;
  background: url(${footerBg});
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

const Heading = styled(motion.h2)`
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 15px;

  span {
    color: ${props => props.accentColor || '#97C049'};
    display: block;
  }

  @media (max-width: 768px) {
    font-size: 1.7rem;
  }
`;

const Description = styled(motion.p)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 700px;
  margin-bottom: 40px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const DownloadButton = styled(motion.button)`
  background: ${props => props.accentColor || '#97C049'};
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 18px 45px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(${props => props.accentRGB || '151, 192, 73'}, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    padding: 16px 35px;
    font-size: 1rem;
  }
`;

const CourseOutline = ({ accentColor, accentRGB }) => {
  return (
    <Section>
      <Container>
        <Heading
          accentColor={accentColor}
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Download the Complete
          <span>Course Outline</span>
        </Heading>

        <Description
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Want a detailed weekly breakdown and project roadmap?
        </Description>

        <DownloadButton
          accentColor={accentColor}
          accentRGB={accentRGB}
          whileHover={{ 
            scale: 1.05,
            boxShadow: `0 15px 40px rgba(${accentRGB || '151, 192, 73'}, 0.5)`
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Download Course PDF
        </DownloadButton>
      </Container>
    </Section>
  );
};

export default CourseOutline;
