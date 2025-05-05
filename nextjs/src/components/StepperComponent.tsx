'use client';

import React from 'react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => {
  const stepLabels = ['Organization', 'Agent Config', 'Ledger Config', 'Processing'];

  return (
    <div className="mb-6">
      {/* Progress Bar */}
      <div className="h-2 rounded-full">
        <div
          className="h-2 bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Circles + Labels */}
      <div className="flex justify-between mt-4">
        {stepLabels.map((label, index) => {
          const stepNum = index + 1;
          const isActive = currentStep >= stepNum;

          return (
            <div key={label} className="flex flex-col items-center text-center w-full">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
              <span className="text-xs mt-1">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;

