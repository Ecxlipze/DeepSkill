import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

const Wrap = styled.form`
  display: grid;
  gap: 22px;
`;

const Section = styled.div`
  background: #111318;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.06);
`;

const SectionTitle = styled.h3`
  margin: 0 0 18px;
  color: #fff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #b8bfcc;
  font-size: 0.9rem;
`;

const Input = styled.input`
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 14px;
  color: #fff;
`;

const Textarea = styled.textarea`
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 14px;
  color: #fff;
  min-height: 92px;
`;

const Select = styled.select`
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 12px 14px;
  color: #fff;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  margin-top: 16px;
`;

const Button = styled.button`
  justify-self: end;
  background: #4F8EF7;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 13px 18px;
  font-weight: 700;
  cursor: pointer;
`;

const initialState = (profile = {}, teacher = {}) => ({
  id: profile.id,
  teacher_id: profile.teacher_id || teacher.id,
  full_name: profile.full_name || teacher.name || '',
  father_name: profile.father_name || '',
  date_of_birth: profile.date_of_birth || '',
  gender: profile.gender || 'Prefer not to say',
  cnic: profile.cnic || teacher.cnic || '',
  personal_phone: profile.personal_phone || teacher.phone || '',
  personal_email: profile.personal_email || teacher.email || '',
  current_address: profile.current_address || '',
  permanent_address: profile.permanent_address || '',
  specialization: profile.specialization || teacher.specialization || '',
  years_experience: profile.years_experience || '',
  last_employer: profile.last_employer || '',
  linkedin: profile.linkedin || '',
  expected_salary: profile.expected_salary || '',
  available_to_join: profile.available_to_join || '',
  teaching_mode: profile.teaching_mode || 'Onsite',
  emergency_name: profile.emergency_name || '',
  emergency_relationship: profile.emergency_relationship || 'Parent',
  emergency_phone: profile.emergency_phone || '',
  current_step: Math.max(2, profile.current_step || 1),
  hr_status: profile.hr_status || 'pending'
});

const HRProfileForm = ({ profile, teacher, onSubmit, loading }) => {
  const [sameAddress, setSameAddress] = useState(false);
  const [formData, setFormData] = useState(() => initialState(profile, teacher));

  const requiredValid = useMemo(() => (
    formData.full_name &&
    formData.father_name &&
    formData.date_of_birth &&
    formData.personal_phone &&
    formData.personal_email &&
    formData.current_address &&
    formData.permanent_address &&
    formData.years_experience &&
    formData.expected_salary &&
    formData.available_to_join &&
    formData.emergency_name &&
    formData.emergency_phone
  ), [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      if (sameAddress && name === 'current_address') {
        next.permanent_address = value;
      }
      return next;
    });
  };

  const handleSameAddress = (event) => {
    const checked = event.target.checked;
    setSameAddress(checked);
    if (checked) {
      setFormData((current) => ({
        ...current,
        permanent_address: current.current_address
      }));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Wrap onSubmit={submit}>
      <Section>
        <SectionTitle>Personal Details</SectionTitle>
        <Grid>
          <Field>Full Name<Input name="full_name" value={formData.full_name} onChange={handleChange} /></Field>
          <Field>Father&apos;s Name<Input name="father_name" value={formData.father_name} onChange={handleChange} /></Field>
          <Field>Date of Birth<Input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} /></Field>
          <Field>Gender
            <Select name="gender" value={formData.gender} onChange={handleChange}>
              <option>Male</option>
              <option>Female</option>
              <option>Prefer not to say</option>
            </Select>
          </Field>
          <Field>CNIC<Input name="cnic" value={formData.cnic} readOnly /></Field>
          <Field>Personal Phone<Input name="personal_phone" value={formData.personal_phone} onChange={handleChange} /></Field>
          <Field>Personal Email<Input type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} /></Field>
          <Field style={{ gridColumn: '1 / -1' }}>Current Address<Textarea name="current_address" value={formData.current_address} onChange={handleChange} /></Field>
          <Field style={{ gridColumn: '1 / -1' }}>Permanent Address<Textarea name="permanent_address" value={formData.permanent_address} onChange={handleChange} /></Field>
        </Grid>
        <CheckboxRow>
          <input type="checkbox" checked={sameAddress} onChange={handleSameAddress} />
          Same as current address
        </CheckboxRow>
      </Section>

      <Section>
        <SectionTitle>Professional Details</SectionTitle>
        <Grid>
          <Field>Specialization<Input name="specialization" value={formData.specialization} onChange={handleChange} /></Field>
          <Field>Years of Experience<Input type="number" name="years_experience" value={formData.years_experience} onChange={handleChange} /></Field>
          <Field>Current / Last Employer<Input name="last_employer" value={formData.last_employer} onChange={handleChange} /></Field>
          <Field>LinkedIn Profile<Input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} /></Field>
          <Field>Expected Monthly Salary<Input type="number" name="expected_salary" value={formData.expected_salary} onChange={handleChange} /></Field>
          <Field>Available to Join<Input type="date" name="available_to_join" value={formData.available_to_join} onChange={handleChange} /></Field>
          <Field>Teaching Mode Preference
            <Select name="teaching_mode" value={formData.teaching_mode} onChange={handleChange}>
              <option>Onsite</option>
              <option>Online</option>
              <option>Hybrid</option>
            </Select>
          </Field>
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Emergency Contact</SectionTitle>
        <Grid>
          <Field>Emergency Contact Name<Input name="emergency_name" value={formData.emergency_name} onChange={handleChange} /></Field>
          <Field>Relationship
            <Select name="emergency_relationship" value={formData.emergency_relationship} onChange={handleChange}>
              <option>Parent</option>
              <option>Spouse</option>
              <option>Sibling</option>
              <option>Other</option>
            </Select>
          </Field>
          <Field>Emergency Phone<Input name="emergency_phone" value={formData.emergency_phone} onChange={handleChange} /></Field>
        </Grid>
      </Section>

      <Button type="submit" disabled={!requiredValid || loading}>
        {loading ? 'Saving...' : 'Save & Continue →'}
      </Button>
    </Wrap>
  );
};

export default HRProfileForm;
