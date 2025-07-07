'use client'

import React, { JSX } from 'react'

import BackButton from '@/components/BackButton'
import { Card } from '@/components/ui/card'
import { IDashboard } from './types/Dashboard'
import { setVerificationRouteType } from '@/lib/verificationSlice'
import { useAppDispatch } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

const SelectionDashboard = ({
  title,
  options,
  backButtonPath,
}: IDashboard): JSX.Element => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleCardClick = (option: {
    heading: string
    path: string | null
  }): void => {
    if (option.path) {
      dispatch(setVerificationRouteType(option.heading))
      router.push(option.path)
    }
  }
  return (
    <div className="h-[700px] px-4 pt-2">
      <div className="relative mb-2 flex items-center justify-between">
        <h1 className="text-muted-foreground/90 text-xl font-semibold sm:text-2xl">
          {title}
        </h1>
        <BackButton path={backButtonPath} />
      </div>
      <div className="rounded-lg border px-6 pt-6 shadow-sm 2xl:col-span-2">
        <p className="text-muted-foreground/90 text-start text-xl font-medium">
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
                    ? 'custom-card group dark:hover:bg-primary hover:bg-primary grid transform cursor-pointer items-center overflow-hidden border p-6 overflow-ellipsis shadow-md transition duration-500 ease-in-out hover:scale-105'
                    : 'bg-muted/30 text-muted/50 grid cursor-not-allowed items-center p-6'
                }`}
                style={{
                  maxHeight: '100%',
                  overflow: 'auto',
                  height: '168px',
                  color: 'inherit',
                }}
                onClick={() => handleCardClick(option)}
              >
                <div
                  className={`flex flex-wrap items-center overflow-hidden min-[401px]:flex-nowrap ${
                    option.path ? 'group-hover:text-primary-foreground' : ''
                  }`}
                  style={{ color: 'inherit' }}
                >
                  <div className="ml-4">
                    <h5
                      className={`text-2xl font-semibold ${
                        option.path
                          ? 'text-primary group-hover:text-primary-foreground'
                          : 'text-muted-foreground/50'
                      } pb-2`}
                    >
                      {option.heading}
                    </h5>
                    <p
                      className={`text-base ${
                        option.path
                          ? 'text-muted-foreground/70 group-hover:text-primary-foreground'
                          : 'text-muted-foreground/50'
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

export default SelectionDashboard
