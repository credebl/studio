'use client'

import React from 'react'
import { stepLabels } from '@/config/CommonConstant'

interface StepperProps {
  currentStep: number
  totalSteps: number
}

const Stepper: React.FC<StepperProps> = ({ currentStep }) => (
  <div className="w-full px-4 py-6">
    <div className="relative mx-auto flex max-w-4xl items-start justify-between">
      {stepLabels.map((label, index) => {
        const stepNum = index + 1
        const isActive = currentStep === stepNum
        const isCompleted = currentStep > stepNum

        return (
          <React.Fragment key={stepNum}>
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold shadow-md transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                } `}
              >
                {isCompleted ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <div
                className={`mt-3 text-center text-xs font-medium whitespace-nowrap ${
                  isActive || isCompleted
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                } `}
              >
                {label}
              </div>
            </div>

            {/* Connector Line */}
            {index < stepLabels.length - 1 && (
              <div
                className="flex flex-1 items-center"
                style={{ marginTop: '24px' }}
              >
                <div className="relative h-1 w-full">
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      currentStep > stepNum ? 'bg-primary' : 'bg-foreground/20'
                    } `}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  </div>
)

export default Stepper
