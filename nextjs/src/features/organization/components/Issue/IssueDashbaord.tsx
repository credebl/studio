'use client'

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import Dashboard from './Dashbord';
import { DidMethod } from '../../../common/enum';
import { RootState } from '@/lib/store';
import { getOrganizationById } from '@/app/api/organization';
import { pathRoutes } from '@/config/pathRoutes';
import { setLedgerId } from '@/lib/orgSlice';
import { storageKeys } from '@/config/CommonConstant';

const IssueDashboard = () => {
const dispatch = useDispatch()
const [isW3cDid, setisW3cDid] = useState<boolean>(false);
const orgId = useSelector((state:RootState)=>state.organization.orgId)
const orgData =async () =>{
    const response = await getOrganizationById(orgId)
    if (typeof response === 'string') {
        // handle the error message
        console.error('Error fetching organization:', response);
      } else {
        const { data } = response;
        console.log("data",data)
        console.log("datadddd",data.data.org_agents[0].orgDid)
        const orgDid = data?.data?.org_agents[0]?.orgDid
        dispatch(setLedgerId(data.data.org_agents[0].ledgers.id))
        if(orgDid.includes(DidMethod.POLYGON) || orgDid.includes(DidMethod.WEB) || orgDid.includes(DidMethod.KEY)){
            setisW3cDid(true)
        } else {
            setisW3cDid(false)
        }
        // proceed with data
      }
}
  useEffect(() => {
    orgData();
    }, []);

    const options = [
        {       
            heading: 'Connection',
            description:
            'Issue credential(s) by selecting connection from existing users',
            path: isW3cDid ? pathRoutes.organizations.Issuance.connection : pathRoutes.organizations.Issuance.schema

        },
        {
            heading: 'Email',
            description: 'Issue credential(s) by entering email ID for specific user',
            path: '/organizations/credentials/issue/email',
        },
        {
            heading: 'Bulk',
            description: 'Issue credential(s) by uploading .csv file records',
            path: pathRoutes.organizations.Issuance.bulkIssuance,
        },
    ];

    return (
        <Dashboard
            title="Issue Credential"
            options={options}
            backButtonPath={pathRoutes.organizations.issuedCredentials}
        />
    );
};

export default IssueDashboard;