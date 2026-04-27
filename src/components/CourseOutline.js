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

const CourseOutline = ({ accentColor, accentRGB, pdfUrl }) => {
  const [downloadStatus, setDownloadStatus] = React.useState('idle'); // 'idle', 'downloading', 'completed'

  const handleDownload = async () => {
    if (pdfUrl) {
      setDownloadStatus('downloading');
      try {
        // Use a clean loading state if needed, but for now we'll fetch and download
        const response = await fetch(pdfUrl);
        const blob = await response.blob();

        // Create a local object URL for the blob
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Extract a clean filename and remove leading timestamps
        let fileName = pdfUrl.split('/').pop().split('?')[0].replace(/%20/g, ' ');
        fileName = fileName.replace(/^\d+-/, '');

        link.setAttribute('download', fileName || 'Course-Outline.pdf');

        document.body.appendChild(link);
        link.click();

        // Cleanup
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);

        setDownloadStatus('completed');
        // Reset back to idle after a few seconds
        setTimeout(() => setDownloadStatus('idle'), 3000);
      } catch (error) {
        console.error("Direct download failed, falling back to new tab:", error);
        setDownloadStatus('idle');
        window.open(pdfUrl, '_blank');
      }
    } else {
      alert("Course outline PDF will be available soon!");
    }
  };

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
          disabled={downloadStatus === 'downloading'}
          whileHover={{
            scale: downloadStatus === 'downloading' ? 1 : 1.05,
            boxShadow: `0 15px 40px rgba(${accentRGB || '151, 192, 73'}, 0.5)`
          }}
          whileTap={{ scale: downloadStatus === 'downloading' ? 1 : 0.95 }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          onClick={handleDownload}
          style={{ opacity: downloadStatus === 'downloading' ? 0.8 : 1 }}
        >
          {downloadStatus === 'idle' && "Download Course PDF"}
          {downloadStatus === 'downloading' && "Downloading..."}
          {downloadStatus === 'completed' && "Downloaded "}
        </DownloadButton>
      </Container>
    </Section>
  );
};

export default CourseOutline;
