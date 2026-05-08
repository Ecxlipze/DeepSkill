import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import {
  FaUser, FaEnvelope, FaGraduationCap, FaPhone,
  FaChevronDown, FaCheckCircle, FaFacebook,
  FaInstagram, FaLinkedin, FaGlobe, FaUsers, FaUniversity, FaGift,
  FaCode, FaLaptop, FaPaintBrush, FaWordpress, FaPenNib, FaChartLine
} from "react-icons/fa";
import toast from "react-hot-toast";
import { trackEvent } from "../lib/analytics";

const PageContainer = styled(motion.div)`
  background-color: #000;
  min-height: 100vh;
  padding: 100px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 10% 20%, rgba(123, 31, 46, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(123, 31, 46, 0.1) 0%, transparent 40%);
    pointer-events: none;
  }
`;

const FormTitle = styled(motion.h1)`
  font-family: 'Inter', sans-serif;
  font-size: 3.5rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 60px;
  text-align: center;
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 40px;
  }
`;

const FormGrid = styled(motion.form)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  width: 100%;
  max-width: 1000px;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormCard = styled(motion.div)`
  background: #7B1F2E;
  border-radius: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  position: relative;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  z-index: ${props => props.$active ? 100 : 1};

  &:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  &.full-width {
    grid-column: span 2;
    @media (max-width: 768px) {
      grid-column: span 1;
    }
  }
`;

const Label = styled.label`
  font-family: 'Inter', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Input = styled.input`
  background: transparent;
  border: none;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding: 12px 0;
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  color: #fff;
  outline: none;
  transition: border-color 0.3s ease, padding 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
    font-size: 0.95rem;
  }

  &:focus {
    border-bottom-color: rgba(255, 255, 255, 0.8);
    padding-bottom: 15px;
  }

  /* Prevent white background on autofill (Chrome) */
  &:-webkit-autofill,
  &:-webkit-autofill:hover, 
  &:-webkit-autofill:focus {
    -webkit-text-fill-color: #fff;
    -webkit-box-shadow: 0 0 0px 1000px #7B1F2E inset;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

const CustomDropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.div`
  background: transparent;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding: 12px 0;
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s ease;

  &:hover {
    border-bottom-color: rgba(255, 255, 255, 0.4);
  }

  svg.chevron {
    transition: transform 0.3s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const DropdownList = styled(motion.ul)`
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  right: 0;
  background: #5A1722;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 0;
  list-style: none;
  z-index: 1000;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(15px);
`;

const DropdownItem = styled.li`
  padding: 12px 20px;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.1rem;
  }
`;

/* Age Slider Styled Components */
const SliderContainer = styled.div`
  width: 100%;
  padding: 40px 10px 20px;
  position: relative;
`;

const SliderTrack = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  position: relative;
`;

const SliderProgress = styled.div`
  height: 100%;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  position: absolute;
  left: 0;
  width: ${props => props.$percent}%;
`;

const SliderInput = styled.input`
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 30px;
  background: transparent;
  appearance: none;
  outline: none;
  cursor: pointer;
  z-index: 5;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 24px;
    height: 24px;
    background: #fff;
    border: 4px solid #7B1F2E;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
    transition: transform 0.2s ease;
  }

  &:active::-webkit-slider-thumb {
    transform: scale(1.2);
  }
`;

const ValueLabel = styled(motion.div)`
  position: absolute;
  top: -45px;
  left: ${props => props.$percent}%;
  transform: translateX(-50%);
  background: #fff;
  color: #7B1F2E;
  padding: 5px 12px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #fff;
  }
`;

const SliderRangeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  font-family: 'Inter', sans-serif;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 10px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  cursor: pointer;

  input {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;

    &:checked {
      border-color: #fff;
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: #fff;
        border-radius: 50%;
      }
    }
  }
`;

const ErrorMsg = styled(motion.p)`
  color: #ff9999;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  margin: 0;
  position: absolute;
  bottom: 8px;
`;

const SubmitContainer = styled.div`
  grid-column: span 2;
  display: flex;
  justify-content: center;
  margin-top: 40px;

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const SubmitButton = styled(motion.button)`
  background: #7B1F2E;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 60px;
  font-family: 'Inter', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(123, 31, 46, 0.4);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const SuccessIcon = styled(motion.div)`
  color: #2ecc71;
  font-size: 5rem;
  margin-bottom: 20px;
`;

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    lastEducation: "",
    mobileNo: "",
    age: "18", // Default age for slider
    gender: "",
    source: "",
    selectedCourse: "",
    cnic: "",
    referredBy: "", // Capture referral code
    'bot-field': "" // Honeypot
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const courseDropdownRef = useRef(null);
  const educationDropdownRef = useRef(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setIsCourseDropdownOpen(false);
      }
      if (educationDropdownRef.current && !educationDropdownRef.current.contains(event.target)) {
        setIsEducationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Capture Referral Code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setFormData(prev => ({ ...prev, referredBy: refCode }));
      toast.success("Referral applied!", { icon: "🎁" });
    }
  }, []);

  // Success Countdown Timer
  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, countdown]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.trim().length < 3) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 3 characters`;
        } else if (!/^[a-zA-Z\s.-]+$/.test(value)) {
          error = 'Please enter a valid name';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([.-][a-zA-Z0-9]+)+$/.test(value)) {
          error = 'Please enter valid email';
        }
        break;
      case 'mobileNo':
        if (!value.trim()) {
          error = 'Mobile number is required';
        } else if (!/^\+?\d+$/.test(value)) {
          error = 'Please enter a valid phone number';
        } else if (value.trim().length < 10) {
          error = 'Mobile number must be at least 10 characters';
        }
        break;
      case 'cnic':
        if (!value.trim()) {
          error = 'CNIC is required';
        } else if (!/^\d{5}-\d{7}-\d{1}$/.test(value)) {
          error = 'Invalid CNIC format (e.g. 35202-1234567-9)';
        }
        break;
      case 'lastEducation':
        if (!value) error = 'Education selection is required';
        break;
      case 'age':
        if (!value) error = 'Age selection is required';
        break;
      case 'gender':
        if (!value) error = 'Gender selection is required';
        break;
      case 'source':
        if (!value) error = 'Please tell us how you heard about us';
        break;
      case 'selectedCourse':
        if (!value) error = "Please select a course";
        break;
      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'bot-field') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Live validation
    const error = validateField(name, value);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSourceSelect = (val) => {
    setFormData(prev => ({ ...prev, source: val }));
    setIsDropdownOpen(false);
    setErrors(prev => ({ ...prev, source: validateField('source', val) }));
  };

  const handleCourseSelect = (val) => {
    setFormData(prev => ({ ...prev, selectedCourse: val }));
    setIsCourseDropdownOpen(false);
    setErrors(prev => ({ ...prev, selectedCourse: validateField('selectedCourse', val) }));
  };

  const handleEducationSelect = (val) => {
    setFormData(prev => ({ ...prev, lastEducation: val }));
    setIsEducationDropdownOpen(false);
    setErrors(prev => ({ ...prev, lastEducation: validateField('lastEducation', val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const applicationData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobileNo,
          cnic: formData.cnic,
          course: formData.selectedCourse,
          education: formData.lastEducation,
          hear_about_us: formData.source,
          gender: formData.gender,
          age: formData.age,
          referred_by: formData.referredBy
        };
        await register(applicationData);
        trackEvent('generate_lead', {
          form_name: 'registration',
          course: formData.selectedCourse
        });
        setIsSuccess(true);
      } catch (err) {
        console.error("Registration failed", err);
        toast.error(err.message || 'There was an error with your registration. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const sourceOptions = [
    { label: "Facebook", icon: <FaFacebook /> },
    { label: "Instagram", icon: <FaInstagram /> },
    { label: "Linkedin", icon: <FaLinkedin /> },
    { label: "Website", icon: <FaGlobe /> },
    { label: "Friend", icon: <FaUsers /> },
    { label: "Your Institute", icon: <FaUniversity /> }
  ];

  const courseOptions = [
    { label: "Full Stack React JS", icon: <FaCode /> },
    { label: "Full Stack (Laravel)", icon: <FaLaptop /> },
    { label: "Graphic Design Mastery", icon: <FaPaintBrush /> },
    { label: "WordPress Mastery", icon: <FaWordpress /> },
    { label: "UI/UX Design", icon: <FaPenNib /> },
    { label: "SEO & Digital Marketing", icon: <FaChartLine /> }
  ];

  const educationOptions = [
    { label: "Matriculation / O-Levels", icon: <FaUniversity /> },
    { label: "Intermediate (FSc / FA / ICS / A-Levels)", icon: <FaUniversity /> },
    { label: "Bachelor's Degree (BS / BA / Graduation)", icon: <FaGraduationCap /> },
    { label: "Master's Degree (MS / MA / Post-Graduation)", icon: <FaGraduationCap /> },
    { label: "PhD / Doctorate", icon: <FaGraduationCap /> },
    { label: "Other / Diploma", icon: <FaGlobe /> }
  ];

  /* Calculate slider percentage for age values 5 to 65 (60+) */
  const agePercent = ((parseInt(formData.age) - 5) / (65 - 5)) * 100;

  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <FormTitle
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        Deepskills Admission Form
      </FormTitle>

      <FormGrid
        name="registration"
        onSubmit={handleSubmit}
      >
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="bot-field"
          value={formData['bot-field']}
          onChange={handleChange}
          style={{ display: 'none' }}
          tabIndex="-1"
          autoComplete="off"
        />

        {/* First Name */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaUser /> First Name*</Label>
          <Input
            name="firstName"
            placeholder="e.g. John"
            value={formData.firstName}
            onChange={handleChange}
            minLength={3}
            maxLength={50}
            className={errors.firstName ? 'error' : ''}
          />
          <AnimatePresence>
            {errors.firstName && (
              <ErrorMsg
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.firstName}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Last Name */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaUser /> Last Name*</Label>
          <Input
            name="lastName"
            placeholder="e.g. Doe"
            value={formData.lastName}
            onChange={handleChange}
            minLength={3}
            maxLength={50}
            className={errors.lastName ? 'error' : ''}
          />
          <AnimatePresence>
            {errors.lastName && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.lastName}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Email */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaEnvelope /> Email*</Label>
          <Input
            name="email"
            type="email"
            placeholder="e.g. johndoe@example.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          <AnimatePresence>
            {errors.email && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.email}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Last Education Milestone */}
        <FormCard
          $active={isEducationDropdownOpen}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
          ref={educationDropdownRef}
        >
          <Label><FaGraduationCap /> Last Education*</Label>
          <CustomDropdownContainer>
            <DropdownHeader
              $isOpen={isEducationDropdownOpen}
              onClick={() => setIsEducationDropdownOpen(!isEducationDropdownOpen)}
              className={errors.lastEducation ? 'error' : ''}
            >
              {formData.lastEducation ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {educationOptions.find(o => o.label === formData.lastEducation)?.icon}
                  {formData.lastEducation}
                </span>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Choose Education</span>
              )}
              <FaChevronDown className="chevron" />
            </DropdownHeader>

            <AnimatePresence>
              {isEducationDropdownOpen && (
                <DropdownList
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                >
                  {educationOptions.map((opt) => (
                    <DropdownItem
                      key={opt.label}
                      onClick={() => handleEducationSelect(opt.label)}
                    >
                      {opt.icon}
                      {opt.label}
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </AnimatePresence>
          </CustomDropdownContainer>
          <AnimatePresence>
            {errors.lastEducation && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.lastEducation}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Mobile No */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaPhone /> Mobile No.*</Label>
          <Input
            name="mobileNo"
            type="tel"
            placeholder="e.g. +923001234567"
            value={formData.mobileNo}
            onChange={handleChange}
            minLength={10}
            maxLength={15}
            className={errors.mobileNo ? 'error' : ''}
          />
          <AnimatePresence>
            {errors.mobileNo && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.mobileNo}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>
        
        {/* CNIC */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaUser /> CNIC Number*</Label>
          <Input
            name="cnic"
            placeholder="e.g. 35202-1234567-9"
            value={formData.cnic}
            onChange={(e) => {
              // Auto-format CNIC as user types
              let val = e.target.value.replace(/\D/g, '');
              if (val.length > 5) val = val.slice(0, 5) + '-' + val.slice(5);
              if (val.length > 13) val = val.slice(0, 13) + '-' + val.slice(13, 14);
              setFormData(prev => ({ ...prev, cnic: val }));
              setErrors(prev => ({ ...prev, cnic: validateField('cnic', val) }));
            }}
            maxLength={15}
            className={errors.cnic ? 'error' : ''}
          />
          <AnimatePresence>
            {errors.cnic && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.cnic}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Age */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label>Age*</Label>
          <SliderContainer>
            <ValueLabel
              $percent={agePercent}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {formData.age >= 65 ? "60+" : formData.age}
            </ValueLabel>
            <SliderTrack>
              <SliderProgress $percent={agePercent} />
              <SliderInput
                type="range"
                name="age"
                min="5"
                max="65"
                step="1"
                value={formData.age}
                onChange={handleChange}
              />
            </SliderTrack>
            <SliderRangeLabels>
              <span>5 Years</span>
              <span>60+ Years</span>
            </SliderRangeLabels>
          </SliderContainer>
          <AnimatePresence>
            {errors.age && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.age}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Gender */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label>Gender*</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              />
              Male
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              />
              Female
            </RadioLabel>
          </RadioGroup>
          <AnimatePresence>
            {errors.gender && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.gender}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Referral Code (Optional) */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaGift /> Referral Code (Optional)</Label>
          <Input
            name="referredBy"
            placeholder="e.g. DS-XXXX-XXXX"
            value={formData.referredBy}
            onChange={handleChange}
            maxLength={12}
          />
        </FormCard>

        {/* Source Dropdown with Icons */}
        <FormCard
          $active={isDropdownOpen}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
          ref={dropdownRef}
        >
          <Label>How did you hear deepskill?*</Label>
          <CustomDropdownContainer>
            <DropdownHeader
              $isOpen={isDropdownOpen}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {formData.source ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {sourceOptions.find(o => o.label === formData.source)?.icon}
                  {formData.source}
                </span>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Choose Source</span>
              )}
              <FaChevronDown className="chevron" />
            </DropdownHeader>

            <AnimatePresence>
              {isDropdownOpen && (
                <DropdownList
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                >
                  {sourceOptions.map((opt) => (
                    <DropdownItem
                      key={opt.label}
                      onClick={() => handleSourceSelect(opt.label)}
                    >
                      {opt.icon}
                      {opt.label}
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </AnimatePresence>
          </CustomDropdownContainer>
          <AnimatePresence>
            {errors.source && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.source}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Select Course Dropdown */}
        <FormCard
          $active={isCourseDropdownOpen}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
          ref={courseDropdownRef}
          className="full-width"
        >
          <Label><FaGraduationCap /> Select Course*</Label>
          <CustomDropdownContainer>
            <DropdownHeader
              $isOpen={isCourseDropdownOpen}
              onClick={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
            >
              {formData.selectedCourse ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {courseOptions.find(o => o.label === formData.selectedCourse)?.icon}
                  {formData.selectedCourse}
                </span>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>Choose Course</span>
              )}
              <FaChevronDown className="chevron" />
            </DropdownHeader>

            <AnimatePresence>
              {isCourseDropdownOpen && (
                <DropdownList
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                >
                  {courseOptions.map((opt) => (
                    <DropdownItem
                      key={opt.label}
                      onClick={() => handleCourseSelect(opt.label)}
                    >
                      {opt.icon}
                      {opt.label}
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </AnimatePresence>
          </CustomDropdownContainer>
          <AnimatePresence>
            {errors.selectedCourse && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >{errors.selectedCourse}</ErrorMsg>
            )}
          </AnimatePresence>
        </FormCard>

        {/* Submit */}
        <SubmitContainer>
          <SubmitButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </SubmitButton>
        </SubmitContainer>
      </FormGrid>

      {/* Success Overlay */}
      <AnimatePresence>
        {isSuccess && (
          <SuccessOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessIcon
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
            >
              <FaCheckCircle />
            </SuccessIcon>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '20px' }}
            >
              Admission Confirmed!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center' }}
            >
              Thank you for showing interest in <strong>{formData.selectedCourse}</strong> at DeepSkills! <br /><br />
              You will receive a confirmation email shortly. Our team will review your application and update you regarding your admission status within <strong>24-48 hours</strong>.
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '10px' }}
            >
              Redirecting to Sign In Page in {countdown}...
            </motion.div>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              onClick={() => navigate('/login')}
              style={{
                marginTop: '30px',
                background: '#7B1F2E',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '15px 40px',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
            >
              Go to Sign In Page Now
            </motion.button>
          </SuccessOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default RegisterPage;
