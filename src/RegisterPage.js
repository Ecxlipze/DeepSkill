import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { 
  FaUser, FaEnvelope, FaGraduationCap, FaPhone, 
  FaChevronDown, FaCheckCircle, FaFacebook, 
  FaInstagram, FaLinkedin, FaGlobe, FaUsers, FaUniversity 
} from "react-icons/fa";

const PageContainer = styled(motion.div)`
  background-color: #000;
  min-height: 100vh;
  padding: 80px 20px 40px;
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
  z-index: ${props => props.$isDropdownOpen ? 100 : 1};

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
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
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
    source: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const validate = () => {
    let newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.lastEducation) newErrors.lastEducation = "Education is required";
    if (!formData.mobileNo) newErrors.mobileNo = "Mobile number is required";
    if (!formData.age) newErrors.age = "Age selection is required";
    if (!formData.gender) newErrors.gender = "Gender selection is required";
    if (!formData.source) newErrors.source = "Please tell us how you heard about us";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSourceSelect = (val) => {
    setFormData({ ...formData, source: val });
    setIsDropdownOpen(false);
    if (errors.source) {
      setErrors({ ...errors, source: "" });
    }
  };

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      try {
        // Netlify form submission via AJAX
        const encodedData = Object.keys(formData)
          .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(formData[key]))
          .join("&") + "&form-name=registration";

        await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: encodedData
        });

        // Local registration logic
        await register({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.mobileNo
        });
        
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000); // 3 second delay to see success message
      } catch (err) {
        console.error("Registration failed", err);
        alert('There was an error with your registration. Please try again.');
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
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="registration" />
        <p hidden>
          <label>Don't fill this out if you're human: <input name="bot-field" /></label>
        </p>
        {/* First Name */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaUser /> First Name*</Label>
          <Input 
            name="firstName"
            placeholder="e.g. John" 
            value={formData.firstName}
            onChange={handleChange}
          />
          <AnimatePresence>
            {errors.firstName && (
              <ErrorMsg
                initial={{ opacity: 0, y: -10 }}
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
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaUser /> Last Name*</Label>
          <Input 
            name="lastName"
            placeholder="e.g. Doe" 
            value={formData.lastName}
            onChange={handleChange}
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
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaEnvelope /> Email*</Label>
          <Input 
            name="email"
            type="email"
            placeholder="e.g. johndoe@example.com" 
            value={formData.email}
            onChange={handleChange}
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

        {/* Last Education */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaGraduationCap /> Last Education*</Label>
          <Input 
            name="lastEducation"
            placeholder="e.g. Bachelor's Degree" 
            value={formData.lastEducation}
            onChange={handleChange}
          />
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
          transition={{ delay: 0.5 }}
          whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(123, 31, 46, 0.4)" }}
        >
          <Label><FaPhone /> Mobile No.*</Label>
          <Input 
            name="mobileNo"
            type="tel"
            placeholder="e.g. +92 300 1234567" 
            value={formData.mobileNo}
            onChange={handleChange}
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

        {/* Interactive Age Slider */}
        <FormCard
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
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
          transition={{ delay: 0.7 }}
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

        {/* Source Dropdown with Icons */}
        <FormCard
          $isDropdownOpen={isDropdownOpen}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
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
              Application Received!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', maxWidth: '500px' }}
            >
              Thank you for applying to Deepskills. Our admissions team will contact you shortly to guide you on your journey.
            </motion.p>
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => window.location.href = '/'}
              style={{ 
                marginTop: '40px',
                background: '#fff',
                color: '#7B1F2E',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </motion.button>
          </SuccessOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default RegisterPage;
