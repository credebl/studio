'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getOrganizationById } from '@/app/api/organization';
import { apiStatusCodes } from '@/config/CommonConstant';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { HomeIcon, ChevronRight } from 'lucide-react';
import { AxiosResponse } from 'axios';
import CreateOrganizationModal from './create-organization-modal';

type OrganizationDashboardProps = {
  orgId: string;
};



export const OrganizationDashboard = ({ orgId }: OrganizationDashboardProps) => {
  const router = useRouter();
	const [orgData, setOrgData] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    
    const fetchOrganizationDetails = async () => {
      setLoading(true);
      const response = await getOrganizationById(orgId as string);
      const { data } = response as AxiosResponse;
      setLoading(false)
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {			
        
        setOrgData(data?.data);
				
        console.log("orggggggggggggg", orgId);
			

		} else {
			setError(response as string);
		}
		setLoading(false);
	};
  console.log("🚀 ~ OrganizationDashboard ~ orgData:666", orgData)

  const handleEditOrg = () => {
    setOpen(true)
    setMode('edit')
  };

  useEffect(() => {
    fetchOrganizationDetails();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
  
      <Card className='shadow-md'>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16 rounded-md">
                  {orgData?.logoUrl ? (
                    <AvatarImage src={orgData?.logoUrl} alt={orgData?.name} />
                  ) : (
                    <AvatarFallback className="text-gray-800 text-2xl font-bold">
                      {orgData?.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

              <div>
                <h2 className="text-2xl font-bold">{orgData?.name}</h2>
                <p className="text-muted-foreground">{orgData?.description}</p>
                <p className="text-sm mt-1">Profile view : <span className="font-semibold">Private</span></p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="icon" onClick={handleEditOrg}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className='shadow-md'>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-black font-medium">Users</p>
              <h3 className="text-4xl font-bold mt-2">1</h3>
            </div>
            <div className="opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </CardContent>
        </Card>
        
        <Card className='shadow-md'>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-black font-medium">Schemas</p>
              <h3 className="text-4xl font-bold mt-2">7</h3>
            </div>
            <div className="opacity-30">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
          </CardContent>
        </Card>
        
        <Card className='shadow-md'>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-black font-medium">Credentials</p>
              <h3 className="text-4xl font-bold mt-2">35</h3>
            </div>
            <div className="opacity-20">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                <circle cx="9" cy="12" r="2"></circle>
                <path d="M13 12h6"></path>
                <path d="M13 8h6"></path>
                <path d="M13 16h6"></path>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
       <CreateOrganizationModal open={open} setOpen={setOpen} setMessage={setError} mode={mode} orgData={orgData}/>
     
    </div>
  );
};