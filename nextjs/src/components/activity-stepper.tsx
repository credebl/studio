'use client'

import { Check, Circle, Dot } from 'lucide-react'

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
    time: '3 days ago'
  },
  {
    step: 2,
    title: 'AyanWorks organization created',
    description: 'Get started with inviting users to join organization',
    time: 'Last week'
  }
]

export default function RecentActivityStepper() {
  return (
    <div className='flex flex-col gap-10 w-full max-w-md mx-auto'>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const isActive = index === 0
        const isCompleted = index < 0

        return (
          <div key={step.step} className='relative flex items-start gap-6'>
            {/* Vertical line */}
            {!isLast && (
              <div className='absolute left-[18px] top-[38px] h-[105%] w-0.5 bg-muted rounded-full' />
            )}

            {/* Icon */}
            <div className='z-10 shrink-0 rounded-full p-1 bg-background'>
              {isCompleted ? (
                <Check className='w-5 h-5 text-primary' />
              ) : isActive ? (
                <Circle className='w-5 h-5 text-primary' />
              ) : (
                <Dot className='w-5 h-5 text-muted-foreground' />
              )}
            </div>

            {/* Content */}
            <div className='flex flex-col gap-1'>
              <div className='text-xs text-muted-foreground mb-1'>{step.time}</div>
              <div className={`text-sm font-semibold lg:text-base ${isActive ? 'text-primary' : ''}`}>
                {step.title}
              </div>
              <div
                className={`text-xs text-muted-foreground lg:text-sm ${isActive ? 'text-primary' : ''}`}
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
