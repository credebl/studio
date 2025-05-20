'use client'

import React, { JSX } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IDashboard } from '../type/Dashboard'
import { useRouter } from 'next/navigation'

const Dashboard = ({
  title,
  options,
  backButtonPath,
}: IDashboard): JSX.Element => {
  const router = useRouter()
  return (
    <div className="h-[700px] h-full px-4 pt-2">
      <div className="relative mb-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          {title}
        </h1>
        <Button
          title={title}
          onClick={() => router.push(backButtonPath)}
          className="text-base"
        >
          Back
        </Button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white px-6 pt-6 shadow-sm 2xl:col-span-2 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-start text-xl font-medium text-gray-900 dark:text-white">
          Select the appropriate action
        </p>
        <div className="grid grid-cols-1 gap-8 pt-12 pb-16 lg:grid-cols-3">
          {options.map(
            (option: {
              heading: string
              path: string
              description: string
            }) => (
              <Card
                key={option.heading}
                className={`${
                  option.path
                    ? 'custom-card group dark:hover:bg-primary hover:bg-primary grid transform cursor-pointer items-center overflow-hidden border border-gray-200 p-6 overflow-ellipsis shadow-md transition duration-500 ease-in-out hover:scale-105'
                    : 'grid cursor-not-allowed items-center bg-gray-300 p-6 text-gray-500 dark:border-gray-600 dark:bg-gray-700'
                }`}
                style={{
                  maxHeight: '100%',
                  overflow: 'auto',
                  height: '168px',
                  color: 'inherit',
                }}
                onClick={() => option.path && router.push(option.path)}
              >
                <div
                  className={`flex flex-wrap items-center overflow-hidden min-[401px]:flex-nowrap ${
                    option.path ? 'group-hover:text-white' : ''
                  }`}
                  style={{ color: 'inherit' }}
                >
                  <div className="ml-4">
                    <h5
                      className={`text-2xl font-semibold ${
                        option.path
                          ? 'text-primary group-hover:text-white dark:text-white'
                          : 'text-gray-500'
                      } pb-2`}
                    >
                      {option.heading}
                    </h5>
                    <p
                      className={`text-base ${
                        option.path
                          ? 'text-gray-700 group-hover:text-white dark:text-white'
                          : 'text-gray-500'
                      }`}
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
