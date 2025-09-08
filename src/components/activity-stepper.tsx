'use client'

import { Check, Circle, Dot } from 'lucide-react'

import React from 'react'

type Step = {
  step: number
  title: string
  description: string
  time: string
}

const steps: Step[] = [
  {
    step: 1,
    title: 'MongoTech organization created',
    description: 'Get started with inviting users to join organization',
    time: '3 days ago',
  },
  {
    step: 2,
    title: 'AyanWorks organization created',
    description: 'Get started with inviting users to join organization',
    time: 'Last week',
  },
]

export default function RecentActivityStepper(): React.JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-10">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const isActive = index === 0
        const isCompleted = index < 0

        let Icon: React.JSX.Element = (
          <Dot className="text-muted-foreground h-5 w-5" />
        )

        if (isCompleted) {
          Icon = <Check className="text-primary h-5 w-5" />
        } else if (isActive) {
          Icon = <Circle className="text-primary h-5 w-5" />
        }

        return (
          <div key={step.step} className="relative flex items-start gap-6">
            {/* Vertical line */}
            {!isLast && (
              <div className="bg-muted absolute top-[38px] left-[18px] h-[105%] w-0.5 rounded-full" />
            )}

            {/* Icon */}
            {/* Icon */}
            <div className="bg-background z-10 shrink-0 rounded-full p-1">
              {Icon}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
              <div className="text-muted-foreground mb-1 text-xs">
                {step.time}
              </div>
              <div
                className={`text-sm font-semibold lg:text-base ${isActive ? 'text-primary' : ''}`}
              >
                {step.title}
              </div>
              <div
                className={`text-muted-foreground text-xs lg:text-sm ${isActive ? 'text-primary' : ''}`}
              >
                {step.description}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
