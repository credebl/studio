import React, { useEffect, useState } from "react"
import type { AxiosResponse } from 'axios';
import {getPublicOrgDetails} from '../../api/organization'
import { apiStatusCodes } from "../../config/CommonConstant";
import ProfilesDesign from "../publicProfile/ProfilesDesign";


interface OrgInterface {
        name: string;
        website: string;
        logoUrl: string;
        description: string;
    
}

const PublicOrganizationDetails = ({orgSlug}: {orgSlug: string}) => {

    const [orgData, setOrgData] = useState<OrgInterface | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);


    const getOrganizationData = async () => {
		setLoading(true);
		const response = await getPublicOrgDetails(orgSlug);

		const { data } = response as AxiosResponse

		if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {
			
            setOrgData(data?.data);

		} else {
			setError(response as string);
		}
		setLoading(false);
	};

    useEffect(()=>{

        getOrganizationData()

    },[])


    return (
        <div>
            <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100">
                <div className="h-screen col-span-1 border">
                    {
                        orgData && <ProfilesDesign orgData={orgData} />
                    }
                    
                </div>
            </div>

        </div>
    );
}


export default PublicOrganizationDetails
