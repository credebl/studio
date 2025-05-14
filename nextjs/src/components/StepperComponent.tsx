'use client'

import React from 'react'
import { stepLabels } from '@/config/CommonConstant'

interface StepperProps {
  currentStep: number
  totalSteps: number
}

const Stepper: React.FC<StepperProps> = ({ currentStep, totalSteps }) => (
  <div className="mb-6">
    {/* Progress Bar */}
    <div className="h-2 rounded-full">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>

    {/* Step Circles + Labels */}
    <div className="mt-4 flex justify-between">
      {stepLabels.map((label, index) => {
        const stepNum = index + 1
        const isActive = currentStep >= stepNum

        return (
          <div
            key={label}
            className="flex w-full flex-col items-center text-center"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {stepNum}
            </div>
            <span className="mt-1 text-xs">{label}</span>
          </div>
        )
      })}
    </div>
  </div>
)

export default Stepper
