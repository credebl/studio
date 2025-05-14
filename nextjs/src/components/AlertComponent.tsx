import { IAlertComponent } from '@/common/interface'
import React from 'react'

export const AlertComponent = ({
  message,
  type,
  viewButton,
  onAlertClose,
  path = '',
}: IAlertComponent): React.JSX.Element | boolean => {
  const getAlertClass = (): string => {
    switch (type) {
      case 'warning':
        return 'text-yellow-700 bg-yellow-100 border-yellow-500 dark:bg-yellow-200 dark:text-yellow-800'
      case 'failure':
        return 'text-red-700 bg-red-100 border-red-500 dark:bg-red-200 dark:text-red-800'
      case 'success':
        return 'text-green-700 bg-green-100 border-green-500 dark:bg-green-200 dark:text-green-800'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-500 dark:bg-gray-200 dark:text-gray-800'
    }
  }

  return (
    message !== null && (
      <div className="w-full">
        <div
          className={`mb-4 flex flex-col gap-2 rounded-lg p-4 text-sm ${getAlertClass()}`}
          role="alert"
        >
          <div
            className="flex w-full items-center"
            data-testid="flowbite-alert-wrapper"
          >
            <div className="w-full">
              <div className="flex w-full flex-wrap items-center justify-between">
                <div>{message}</div>
                {viewButton && (
                  <div className="text-primary-700 mr-2 flex justify-end text-right text-base md:w-32 lg:w-48">
                    <a href={path}>View more... </a>
                  </div>
                )}
              </div>
            </div>
            <button
              aria-label="Dismiss"
              className={`-mx-1.5 -my-1.5 ml-auto inline-flex h-8 w-8 rounded-lg p-1.5 ${getAlertClass()}`}
              type="button"
              onClick={onAlertClose}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 20 20"
                aria-hidden="true"
                className={`h-5 w-5 ${getAlertClass()}`}
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  )
}
