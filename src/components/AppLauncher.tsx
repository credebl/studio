'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { JSX } from 'react'
import appsData from '../../data/appLauncher.json'
import { useAppSelector } from '@/lib/hooks'

type AppLauncherInterface = {
  name: string
  logo: string
  link: string
  'link-local'?: string
  'link-dev'?: string
  'link-qa'?: string
}

export default function AppLauncher(): JSX.Element {
  const env: string = (process.env.NEXT_PUBLIC_MODE || 'LOCAL').toUpperCase()
  const currentApp: string = (
    process.env.NEXT_PUBLIC_APP_NAME || ''
  ).toUpperCase()

  const selectedOrg = useAppSelector((state) => state.organization.orgInfo)

  const getAppLink = (app: AppLauncherInterface): string => {
    switch (env) {
      case 'LOCAL':
        return app['link-local'] || app.link
      case 'DEV':
        return app['link-dev'] || app.link
      case 'QA':
        return app['link-qa'] || app.link
      case 'PROD':
      default:
        return app.link
    }
  }

  const allApps: AppLauncherInterface[] =
    Array.isArray(selectedOrg?.appLaunchDetails) &&
    selectedOrg.appLaunchDetails.length > 0
      ? (selectedOrg.appLaunchDetails as AppLauncherInterface[])
      : appsData

  const launcherApps = allApps.filter(
    (app) => app.name.toUpperCase() !== currentApp,
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="hamburger"
          size="icon"
          className="h-12 w-12 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            className="!h-8 !w-8"
            id="dots-nine"
          >
            <circle cx="60" cy="60" r="16"></circle>
            <circle cx="128" cy="60" r="16"></circle>
            <circle cx="196" cy="60" r="16"></circle>
            <circle cx="60" cy="128" r="16"></circle>
            <circle cx="128" cy="128" r="16"></circle>
            <circle cx="196" cy="128" r="16"></circle>
            <circle cx="60" cy="196" r="16"></circle>
            <circle cx="128" cy="196" r="16"></circle>
            <circle cx="196" cy="196" r="16"></circle>
          </svg>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="mr-4 flex w-[260px] flex-col items-center rounded-2xl p-4 text-center shadow-xl"
        align="center"
        side="bottom"
      >
        <h3 className="mb-4 text-center text-lg font-semibold">App Launcher</h3>
        <div className="grid grid-cols-2 place-items-center">
          {launcherApps.map((app: AppLauncherInterface) => (
            <a
              key={app.name}
              href={getAppLink(app)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center rounded-xl p-3 text-center transition hover:bg-gray-100"
            >
              <Image
                src={app.logo}
                alt={app.name}
                width={40}
                height={40}
                className="mx-auto rounded-md"
              />
              <span className="text-md mt-2 font-medium">{app.name}</span>
            </a>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
