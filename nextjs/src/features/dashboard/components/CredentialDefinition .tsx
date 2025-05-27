'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ToolTipDataForCredDef } from './TooltipData'
import { getAllCredDef } from '@/app/api/schema'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

interface CredentialDefinitionType {
  tag: string
  credentialDefinitionId: string
  schemaLedgerId: string
  // Add other properties if they exist
}

const CredentialDefinition = (): React.JSX.Element => {
  const [loading, setLoading] = useState(true)
  const [credentialDefinition, setCredentialDefinition] = useState<
    CredentialDefinitionType[]
  >([])

  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)
  const fetchCredentialDefinitionById = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await getAllCredDef(orgId as string)
      if (typeof response !== 'string' && response?.data?.data?.data) {
        setCredentialDefinition(response.data.data.data)
      } else {
        setCredentialDefinition([])
      }
    } catch (err) {
      console.error('Error fetching credential definition:', err)
      setCredentialDefinition([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orgId) {
      fetchCredentialDefinitionById()
    }
  }, [orgId])

  const handleClickCredDef = (schemaId: string): void => {
    router.push(`/organizations/schemas/${schemaId}`)
  }

  return (
    <Card className="border-border relative h-full w-full overflow-hidden rounded-xl border py-4 shadow-xl transition-transform duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle>Credential Definitions</CardTitle>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  <ToolTipDataForCredDef />
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge>{credentialDefinition.length}</Badge>
          </div>
          <CardDescription>Manage your credential definitions</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
              </div>
            ))}
          </div>
        ) : credentialDefinition.length > 0 ? (
          <div className="space-y-4">
            {credentialDefinition.slice(0, 3).map((cred, index) => (
              <button
                key={index}
                type="button"
                className="hover:bg-muted/50 border-border/50 relative flex h-full w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border p-3 text-left shadow-xl transition-transform duration-300"
                onClick={() =>
                  handleClickCredDef(encodeURIComponent(cred.schemaLedgerId))
                }
              >
                <div className="flex w-full items-center gap-3">
                  <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M15 9H18.75M15 12H18.75M15 15H18.75M4.5 19.5H19.5C20.0967 19.5 20.669 19.2629 21.091 18.841C21.5129 18.419 21.75 17.8467 21.75 17.25V6.75C21.75 6.15326 21.5129 5.58097 21.091 5.15901C20.669 4.73705 20.0967 4.5 19.5 4.5H4.5C3.90326 4.5 3.33097 4.73705 2.90901 5.15901C2.48705 5.58097 2.25 6.15326 2.25 6.75V17.25C2.25 17.8467 2.48705 18.419 2.90901 18.841C3.33097 19.2629 3.90326 19.5 4.5 19.5ZM10.5 9.375C10.5 9.62123 10.4515 9.86505 10.3573 10.0925C10.263 10.32 10.1249 10.5267 9.95083 10.7008C9.77672 10.8749 9.57002 11.013 9.34253 11.1073C9.11505 11.2015 8.87123 11.25 8.625 11.25C8.37877 11.25 8.13495 11.2015 7.90747 11.1073C7.67998 11.013 7.47328 10.8749 7.29917 10.7008C7.12506 10.5267 6.98695 10.32 6.89273 10.0925C6.7985 9.86505 6.75 9.62123 6.75 9.375C6.75 8.87772 6.94754 8.40081 7.29917 8.04918C7.65081 7.69754 8.12772 7.5 8.625 7.5C9.12228 7.5 9.59919 7.69754 9.95082 8.04918C10.3025 8.40081 10.5 8.87772 10.5 9.375ZM11.794 15.711C10.8183 16.2307 9.72947 16.5017 8.624 16.5C7.5192 16.5014 6.4311 16.2304 5.456 15.711C5.69429 15.0622 6.12594 14.5023 6.69267 14.1067C7.25939 13.7111 7.93387 13.499 8.625 13.499C9.31613 13.499 9.99061 13.7111 10.5573 14.1067C11.1241 14.5023 11.5557 15.0622 11.794 15.711Z"
                        stroke="#6B7280"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 font-medium">
                    <div>{cred.tag}</div>
                    <div className="text-muted-foreground truncate break-all">
                      {cred.credentialDefinitionId}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">
              No credential definitions found.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-auto justify-end pt-2">
        {/* <Link href='#'>View all</Link> */}
      </CardFooter>
    </Card>
  )
}

export default CredentialDefinition
