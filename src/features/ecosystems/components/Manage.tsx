'use client'

import { JSX, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, useSearchParams } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Create from './Create'
import { Invitaitons } from './Invitations'
import { Members } from './Members'
import { useAppSelector } from '@/lib/hooks'

const Manage = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState('Invitations')
  const ecosystemName = useAppSelector((state) => state.ecosystem.name)
  const searchParams = useSearchParams()
  const showCreateForm = searchParams.get('createNew') === 'true'
  const router = useRouter()
  return (
    <div className="mx-6">
      <div className="mb-2">
        <div className="flex items-center justify-between gap-2">
          {showCreateForm ? (
            <h2 className="mb-2 text-2xl font-bold tracking-tight">
              Create New Ecosystem
            </h2>
          ) : (
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {ecosystemName &&
                  ecosystemName[0].toUpperCase() + ecosystemName.slice(1)}
              </h2>
              <p className="text-muted-foreground">
                Manage details of {ecosystemName}
              </p>
            </div>
          )}
          <Button
            onClick={() => router.push('/ecosystems')}
            className="mt-5 ml-2"
          >
            <ArrowLeft />
            Back
          </Button>
        </div>
      </div>
      <Tabs
        value={showCreateForm ? 'Create' : activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="Invitations" className="relative">
            Invitations
          </TabsTrigger>
          <TabsTrigger value="Members" className="relative">
            Members
          </TabsTrigger>
          <TabsTrigger value="Create" disabled={!showCreateForm}>
            Create
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Invitations">
          <Invitaitons />
        </TabsContent>
        <TabsContent value="Members">
          <Members />
        </TabsContent>
        <TabsContent
          value="Create"
          className="mt-2 space-y-4 rounded-md border p-4"
        >
          <Create />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Manage
