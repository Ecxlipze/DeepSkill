import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "./supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaTimes } from "react-icons/fa";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import leftBtnIcon from "./assets/left-btn.svg";
import rightBtnIcon from "./assets/right-btn.svg";

const dummyTestimonials = [
  { id: 'dummy-1', student_name: 'Ali Khan', course_name: 'Graphic Design Mastery', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail_url: null },
  { id: 'dummy-2', student_name: 'Ayesha Rahman', course_name: 'Laravel PHP Development', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail_url: null },
  { id: 'dummy-3', student_name: 'Usman Tariq', course_name: 'Full Stack React JS', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail_url: null },
  { id: 'dummy-4', student_name: 'Fatima Noor', course_name: 'WordPress Mastery', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumbnail_url: null }
];

const Section = styled.section`
  padding: 40px 20px;
  background-color: #000;
  text-align: center;
`;

const Title = styled.h2`
  font-family: 'Inter', sans-serif;
  font-size: 2.4rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 40px;
  padding: 0 20px;
`;

const GlowContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  filter: drop-shadow(0 0 40px rgba(255, 0, 64, 0.4));
`;

const MainBox = styled.div`
  background-color: #7B1F2E;
  position: relative;
  z-index: 1;
  padding: 30px 40px;
  /* Cut top-right and bottom-left only */
  clip-path: polygon(
    0 0, 
    calc(100% - 60px) 0, 
    100% 60px, 
    100% 100%, 
    60px 100%, 
    0 calc(100% - 60px)
  );
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 1024px) {
    padding: 50px 40px;
  }
  @media (max-width: 768px) {
    padding: 40px 40px;
    border-radius: 30px;
  }
`;

const SliderWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  /* Add padding to wrapper to make room for absolute arrows */
  padding: 0 40px;

  .slick-list {
    margin: 0 -15px;
  }
  .slick-slide > div {
    padding: 0 15px;
  }

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const VideoCard = styled(motion.div)`
  background-color: #d9d9d9;
  border-radius: 20px;
  height: 500px;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  /* Force minimum width on mobile to avoid squishing */
  @media (max-width: 768px) {
    height: 480px;
    width: 100% !important;
    max-width: 380px;
    margin: 0 auto;
  }
`;

const ArrowBtn = styled(motion.div)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  /* Position arrows in the wrapper padding, outside the cards */
  &.slick-prev {
    left: -90px;
  }
  &.slick-next {
    right: -90px;
  }

  &::before {
    display: none;
  }

  @media (max-width: 768px) {
    /* Hide arrows on mobile for a cleaner swipe experience */
    display: none !important;
  }
`;

const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <ArrowBtn className="slick-prev" onClick={onClick} whileHover={{ x: -10 }}>
      <img src={leftBtnIcon} alt="Previous" style={{ width: 45, height: 45 }} />
    </ArrowBtn>
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <ArrowBtn className="slick-next" onClick={onClick} whileHover={{ x: 10 }}>
      <img src={rightBtnIcon} alt="Next" style={{ width: 45, height: 45 }} />
    </ArrowBtn>
  );
};

const PlayIconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(123, 31, 46, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.5rem;
  z-index: 3;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  transition: all 0.3s ease;
  padding-left: 5px; /* Offset for optical alignment of play icon */

  ${VideoCard}:hover & {
    transform: translate(-50%, -50%) scale(1.1);
    background: #e62e4d;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  cursor: auto;
`;

const ModalContent = styled(motion.div)`
  width: 100%;
  max-width: 900px;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);

  video, iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: #fff;
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: #e62e4d;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    z-index: 10;
    background: rgba(0,0,0,0.5);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }
`;

const FunctionalVideoCard = ({ studentName, videoUrl, thumbnail, course, onPlayClick }) => {
  const isDirectVideo = videoUrl && videoUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <VideoCard whileHover={{ scale: 1.02 }} onClick={() => onPlayClick(videoUrl)}>
      {/* Background Image/Thumbnail */}
      {thumbnail ? (
        <img src={thumbnail} alt="Video Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', zIndex: 0 }} />
      ) : isDirectVideo ? (
        <video
          src={videoUrl}
          muted
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0, pointerEvents: 'none' }}
        />
      ) : videoUrl ? (
        <iframe
          title="Student Testimonial Thumbnail"
          src={`${videoUrl}${videoUrl.includes('?') ? '&' : '?'}controls=0`}
          frameBorder="0"
          className="thumbnail-iframe"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        ></iframe>
      ) : (
        <div style={{ width: '100%', height: '100%', background: '#333', position: 'absolute', zIndex: 0 }} />
      )}
      
      <PlayIconWrapper>
        <FaPlay />
      </PlayIconWrapper>

      {/* Gradient overlay to make text readable */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', zIndex: 1, pointerEvents: 'none' }} />
      
      {/* Information */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: '#fff', zIndex: 2, textAlign: 'left', pointerEvents: 'none' }}>
        {studentName && <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', fontFamily: 'Asimovian, sans-serif' }}>{studentName}</h3>}
        {course && <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc', fontFamily: 'Inter, sans-serif' }}>{course}</p>}
      </div>
    </VideoCard>
  );
};

const TestimonialSection = ({ courseName = "General" }) => {
  const [modalVideo, setModalVideo] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      
      if (courseName !== "All") {
        query = query.eq('course_name', courseName);
      }

      const { data, error } = await query;
      if (error) {
        console.error(error);
        setTestimonials(dummyTestimonials);
      } else {
        setTestimonials([...(data || []), ...dummyTestimonials]);
      }
      setLoading(false);
    };
    fetchTestimonials();
  }, [courseName]);

  const settings = {
    dots: true,
    infinite: testimonials.length > 2,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
          centerMode: false,
          adaptiveHeight: true
        }
      }
    ]
  };

  if (loading) return null;
  if (!loading && testimonials.length === 0) return null;

  return (
    <Section id="testimonials">
      <Title
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Testimonials
      </Title>

      <GlowContainer
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <MainBox>
          <SliderWrapper>
            <Slider {...settings}>
              {testimonials.map((testimonial) => (
                <FunctionalVideoCard
                  key={testimonial.id}
                  studentName={testimonial.student_name}
                  videoUrl={testimonial.video_url}
                  thumbnail={testimonial.thumbnail_url}
                  course={testimonial.course_name}
                  onPlayClick={setModalVideo}
                />
              ))}
            </Slider>
          </SliderWrapper>
        </MainBox>
      </GlowContainer>

      <AnimatePresence>
        {modalVideo && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalVideo(null)}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
              <CloseButton onClick={() => setModalVideo(null)}>
                <FaTimes />
              </CloseButton>
              <ModalContent
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {modalVideo.match(/\.(mp4|webm|ogg)$/i) ? (
                  <video src={modalVideo} controls autoPlay playsInline />
                ) : (
                  <iframe
                    title="Student Testimonial Video"
                    src={`${modalVideo}${modalVideo.includes('?') ? '&' : '?'}autoplay=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                )}
              </ModalContent>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </Section>
  );
};

export default TestimonialSection;
