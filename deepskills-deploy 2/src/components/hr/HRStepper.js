import React from 'react';
import styled from 'styled-components';

const STEPS = [
  'Personal Info',
  'Documents',
  'JD Review',
  'Signature',
  'Hiring Files'
];

const StepperWrap = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }
`;

const StepItem = styled.div`
  min-width: 140px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${({ $state }) => {
    if ($state === 'complete') return '#2ecc71';
    if ($state === 'current') return '#4F8EF7';
    return '#7b8190';
  }};
`;

const Circle = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  border: 2px solid ${({ $state }) => {
    if ($state === 'complete') return '#2ecc71';
    if ($state === 'current') return '#4F8EF7';
    return 'rgba(255,255,255,0.16)';
  }};
  background: ${({ $state }) => {
    if ($state === 'complete') return 'rgba(46, 204, 113, 0.14)';
    if ($state === 'current') return '#4F8EF7';
    return 'transparent';
  }};
  color: ${({ $state }) => ($state === 'current' ? '#fff' : 'inherit')};
  flex-shrink: 0;
`;

const StepLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
`;

const Connector = styled.div`
  width: 24px;
  height: 1px;
  background: rgba(255,255,255,0.12);
  flex-shrink: 0;
`;

const getStepState = (index, currentStep) => {
  const stepNumber = index + 1;
  if (stepNumber < currentStep) return 'complete';
  if (stepNumber === currentStep) return 'current';
  return 'locked';
};

const getStepSymbol = (state, index) => {
  if (state === 'complete') return '✓';
  if (state === 'current') return index + 1;
  return '';
};

const HRStepper = ({ currentStep = 1 }) => (
  <StepperWrap>
    {STEPS.map((step, index) => {
      const state = getStepState(index, currentStep);
      return (
        <React.Fragment key={step}>
          <StepItem $state={state}>
            <Circle $state={state}>{getStepSymbol(state, index)}</Circle>
            <StepLabel>{step}</StepLabel>
          </StepItem>
          {index !== STEPS.length - 1 && <Connector />}
        </React.Fragment>
      );
    })}
  </StepperWrap>
);

export default HRStepper;
