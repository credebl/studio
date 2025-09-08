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
import { CredentialDefinitionIcon } from '@/components/iconsSvg'
import { Skeleton } from '@/components/ui/skeleton'
import { ToolTipDataForCredDef } from './TooltipData'
import { getAllCredDef } from '@/app/api/schema'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

interface CredentialDefinitionType {
  tag: string
  credentialDefinitionId: string
  schemaLedgerId: string
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
    router.push(`/schemas/${schemaId}`)
  }

  return (
    <Card className="border-border relative h-full w-full overflow-hidden rounded-xl border py-4 transition-transform duration-300">
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
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, id) => (
              <div
                key={`skeleton-${id}`}
                className="flex items-center justify-between rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {credentialDefinition.length > 0 ? (
          <div className="space-y-4">
            {credentialDefinition.slice(0, 3).map((cred, index) => (
              <button
                key={`${cred.credentialDefinitionId}-${index}`}
                type="button"
                className="hover:bg-muted/50 border-border/50 relative flex h-full w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border p-3 text-left shadow-xl transition-transform duration-300"
                onClick={() =>
                  handleClickCredDef(encodeURIComponent(cred.schemaLedgerId))
                }
              >
                <div className="flex w-full items-center gap-3">
                  <div className="bg-background flex h-10 w-10 items-center justify-center rounded-md">
                    <CredentialDefinitionIcon />
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
