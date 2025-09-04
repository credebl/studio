import React from 'react'

type StepStatus = 'done' | 'inProgress' | 'pending'

const getStepStatus = (step: number, currentStep: number): StepStatus => {
  if (currentStep > step) {
    return 'done'
  }
  if (currentStep === step) {
    return 'inProgress'
  }
  return 'pending'
}

const StepIcon = ({ status }: { status: StepStatus }): React.JSX.Element => {
  if (status === 'done') {
    return (
      <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-green-500 bg-green-200 ring-6 ring-white dark:bg-green-900 dark:ring-gray-900">
        <svg
          className="h-3.5 w-3.5 text-green-500 dark:text-green-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 16 12"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M1 5.917 5.724 10.5 15 1.5"
          />
        </svg>
      </span>
    )
  }

  if (status === 'inProgress') {
    return (
      <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-blue-400 bg-gray-100 ring-6 ring-white dark:bg-gray-700 dark:ring-gray-900"></span>
    )
  }

  // pending
  return (
    <span className="absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 bg-gray-100 ring-6 ring-white dark:bg-gray-700 dark:ring-gray-900"></span>
  )
}

const WalletStepsComponent = (props: { steps: number }): React.JSX.Element => {
  const steps = [
    'Wallet creation is in progress',
    'Starting the DID publishing process...',
    'DID Publishing process is all done!',
    'Creating an invitation URL...',
    'Invitation URL successfully created!',
  ]

  return (
    <div className="mt-4 ml-4 w-full">
      <ol className="relative border-l border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          const status = getStepStatus(stepNumber, props.steps)
          return (
            <li key={stepNumber} className="mb-10 ml-6">
              <StepIcon status={status} />
              <h3 className="leading-tight font-medium">{label}</h3>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default WalletStepsComponent
