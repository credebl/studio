import React, { JSX } from 'react'
import { handleDrop, handleInputChange } from './BulkIssuanceFunctions'

import { AlertComponent } from '@/components/AlertComponent'
import { IContext } from '../type/BulkIssuance'
import { handleDiscardFile } from './BulkIssuanceUtils'

interface DragAndDropProps {
  context: IContext
}

export default function DragAndDrop({
  context,
}: DragAndDropProps): JSX.Element {
  const clearError = (): void => {
    context.setUploadMessage(null)
  }

  const handleDragOver = (e: { preventDefault: () => void }): void => {
    e.preventDefault()
  }

  return (
    <div
      onDrop={(event) => handleDrop(event, context)}
      onDragOver={handleDragOver}
      role="region"
      tabIndex={0}
      className="w-fit px-8"
    >
      {' '}
      <div className="h-full lg:flex">
        <div>
          <label
            htmlFor="csv-file"
            className={`flex h-36 w-40 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed ${
              !context.isCredSelected
                ? 'border-gray-200'
                : 'border-primary dark:border-white'
            }`}
          >
            <div
              className={`flex flex-col items-center justify-center pt-5 pb-6 ${
                !context.isCredSelected
                  ? 'border-gray-700 text-gray-700 opacity-50 dark:text-gray-700'
                  : 'text-primary border-primary dark:border-white dark:text-white'
              }`}
            >
              <svg
                className={`h-12 w-12 ${
                  !context.isCredSelected
                    ? 'text-gray-700 dark:text-gray-400'
                    : 'text-primary dark:text-white'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {' '}
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />{' '}
                <polyline points="16 6 12 2 8 6" />{' '}
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <p
                className={`mt-2 mb-2 text-sm ${
                  !context.isCredSelected
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-primary-900 dark:text-white'
                }`}
              >
                Drag file here
              </p>
            </div>
          </label>
          <div className="justify-center lg:flex">
            <div className="w-fit">
              <label htmlFor="organizationlogo">
                <div
                  className={`border-input bg-background mt-4 border px-4 py-2 shadow-sm rounded-md${
                    !context.isCredSelected
                      ? 'disabled:pointer-events-none disabled:opacity-50 disabled:hover:bg-none'
                      : 'hover:bg-accent hover:text-accent-foreground cursor-pointer'
                  }`}
                >
                  Choose file
                </div>
                <input
                  disabled={!context.isCredSelected}
                  type="file"
                  accept=".csv"
                  name="file"
                  className="hidden"
                  id="organizationlogo"
                  onChange={(event) => handleInputChange(event, context)}
                  title=""
                  onClick={(event) => {
                    ;(event.target as HTMLInputElement).value = ''
                  }}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col justify-between lg:pb-8 lg:pb-12 lg:pl-6">
          {context.uploadedFileName && (
            <div
              className={`${
                !context.isCredSelected ? 'opacity-50' : ''
              } mb-4 flex items-center justify-between gap-2 rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-700`}
            >
              <p className="word-break-word px-2 text-gray-700 dark:text-white">
                {context.uploadedFileName}
              </p>
              <button
                onClick={() => handleDiscardFile(context)}
                className="shrink-0 cursor-pointer dark:text-white"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          {context.uploadMessage !== null && (
            <AlertComponent
              message={context.uploadMessage.message}
              type={context.uploadMessage?.type || 'success'}
              onAlertClose={clearError}
            />
          )}
        </div>
      </div>
    </div>
  )
}
