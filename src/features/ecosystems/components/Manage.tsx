'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/lib/hooks";
import { useState } from "react";
import Create from "./Create";
import { useSearchParams } from "next/navigation";
import { Invitaitons } from "./Invitations";

const Manage = () => {
  const [activeTab, setActiveTab] = useState('Invitations')
  const ecosystemName = useAppSelector((state) => state.ecosystem.name)
  const searchParams = useSearchParams();
  const showCreateForm = searchParams.get('createNew') === 'true';
  return (
      <div className="mx-6">
        <div className="mb-2">
          <h2 className="text-2xl font-bold tracking-tight">{ecosystemName && ecosystemName[0].toUpperCase() + ecosystemName.slice(1)}</h2>
          <p className="text-muted-foreground">
            Manage details of {ecosystemName}
          </p>
        </div>
          <Tabs value={showCreateForm ?'Create' : activeTab} onValueChange={setActiveTab} className="w-full">
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
              <TabsContent
                  value="Invitations"
              >
                <Invitaitons/>
              </TabsContent>
              <TabsContent
                  value="Members"
                  className="mt-2 space-y-4 rounded-md border p-4"
              >
                  Members
              </TabsContent>
              <TabsContent
                  value="Create"
                  className="mt-2 space-y-4 rounded-md border p-4"
              >
                <Create/>
              </TabsContent>
          </Tabs>
      </div>
    );
}
 
export default Manage;