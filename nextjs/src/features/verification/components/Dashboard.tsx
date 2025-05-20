'use client'

import React, { JSX } from 'react'

import BackButton from '@/components/BackButton'
import { Card } from '@/components/ui/card'
import { IDashboard } from '../type/interface'
import { cn } from '@/lib/utils'
import { setVerificationRouteType } from '@/lib/verificationSlice'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'

const Dashboard = ({ title, options }: IDashboard): JSX.Element => {
  const router = useRouter()
  const dispatch = useDispatch()

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
        <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
        <BackButton />
      </div>

      <div className="border/95 rounded-lg px-6 pt-6 shadow-2xl 2xl:col-span-2">
        <p className="text-start text-xl font-medium">
          Select the appropriate action
        </p>

        <div className="grid grid-cols-1 gap-8 pt-12 pb-16 lg:grid-cols-3">
          {options.map((option) => (
            <Card
              key={option.heading}
              onClick={() => handleCardClick(option)}
              className={cn(
                'border-border relative h-full w-full overflow-hidden rounded-xl border py-4 shadow-xl transition-transform duration-300',
                option.path
                  ? 'group hover:bg-accent dark:hover:bg-accent transform cursor-pointer p-6 hover:scale-105'
                  : 'cursor-not-allowed p-6',
              )}
            >
              <div
                className={cn(
                  'flex flex-wrap items-center min-[401px]:flex-nowrap',
                  // option.path && 'group-hover:text-white',
                )}
              >
                <div className="ml-4">
                  <h5
                    className={cn(
                      'pb-2 text-2xl font-semibold',
                      // option.path
                      //   ? 'text-primary group-hover:text-white dark:text-white'
                      //   : 'text-gray',
                    )}
                  >
                    {option.heading}
                  </h5>
                  <p
                    className={cn(
                      'text-base',
                      // option.path
                      //   ? 'text-gray group-hover:text-white dark:text-white'
                      //   : 'text-gray',
                    )}
                  >
                    {option.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
