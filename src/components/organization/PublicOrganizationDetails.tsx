import React, { useEffect, useState } from "react"
import type { AxiosResponse } from 'axios';
import { getPublicOrgDetails } from '../../api/organization'
import { apiStatusCodes } from "../../config/CommonConstant";
import ProfilesDesign from "../publicProfile/ProfilesDesign";
import OrgWalletDetails from "../publicProfile/OrgWalletDetails";
import OrgUserInfo from "../publicProfile/OrgUserInfo";
import { AlertComponent } from "../AlertComponent";
import CustomSpinner from "../CustomSpinner";


interface OrgInterface {
    name: string;
    website: string;
    logoUrl: string;
    description: string;

}

const PublicOrganizationDetails = ({ orgSlug }: { orgSlug: string }) => {

    const [orgData, setOrgData] = useState<OrgInterface | null>(null);
    const [orgUsersData, setOrgUsersData] = useState<object | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getOrganizationData = async () => {
        setLoading(true);
        const response = await getPublicOrgDetails(orgSlug);

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {

            setOrgData(data?.data);

            const orgUsersFilterByRole = data?.data?.userOrgRoles?.filter(
                (users: { orgRole: { name: string }; }) => {
                    return users?.orgRole.name === "owner"
                },
            );

            const usersData = orgUsersFilterByRole?.map(
                (users: { user: { firstName: string } }) => {
                    return users?.user;
                },
            );

            setOrgUsersData(usersData);
        } else {
            setError(response as string);
        }
        setLoading(false);
    };

    useEffect(() => {

        getOrganizationData()

    }, [])


    return (
        <div>
            {(error) && (
                <AlertComponent
                    message={error}
                    type={'failure'}
                    onAlertClose={() => {
                        setError(null);
                    }}
                />
            )}
            {
                loading ? <div className="flex items-center justify-center mb-4 ">
                    <CustomSpinner />
                </div>
                    : <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 p-2 bg-gray-100">
                        <div className="col-span-1 border">
                            {
                                orgData && <ProfilesDesign orgData={orgData} />
                            }

                        </div>
                        <div className="col-span-3 grid grid-rows-2 gap-4 bg-gray-100">
                            <OrgWalletDetails orgData={orgData} />
                            <div className="p-2 rounded bg-white">
                                <h1 className="font-bold text-2xl p-2">Users</h1>
                                <OrgUserInfo orgUsersData={orgUsersData} />
                            </div>
                        </div>
                    </div>
            }

        </div>
    );
}


export default PublicOrganizationDetails
