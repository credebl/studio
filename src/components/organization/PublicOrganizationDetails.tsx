import React, { useEffect, useState } from "react"
import type { AxiosResponse } from 'axios';
import { getPublicOrgDetails } from '../../api/organization'
import { apiStatusCodes } from "../../config/CommonConstant";
import ProfilesDesign from "../publicProfile/ProfilesDesign";
import OrgWalletDetails from "../publicProfile/OrgWalletDetails";
import { AlertComponent } from "../AlertComponent";
import CustomSpinner from "../CustomSpinner";
import type { IOrgData } from "./interfaces";
import { EmptyListMessage } from "../EmptyListComponent";
import { Card } from "flowbite-react";

const PublicOrganizationDetails = ({ orgSlug }: { orgSlug: string }) => {

    const [orgData, setOrgData] = useState<IOrgData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getOrganizationData = async () => {
        setLoading(true);
        try {
            const response = await getPublicOrgDetails(orgSlug);

            const { data } = response as AxiosResponse

            if (data?.statusCode === apiStatusCodes?.API_STATUS_SUCCESS) {

                setOrgData(data?.data);

            } else {
                setError(response as string);
            }
            setLoading(false);
        } catch (err) {
            setLoading(false)
        }
    };

    useEffect(() => {
        getOrganizationData()
    }, [])


    return (
        <div>
            {
                loading ? <div className="flex items-center justify-center w-full min-h-100/5rem">
                    <CustomSpinner />
                </div>
                    :
                    <div>

                        <div>
                            <div className="p-6 pb-6 bg-gray-50 dark:bg-gray-800 min-h-100/5rem">
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
                                    orgData && Object.keys(orgData).length > 0 ?
                                        <div className="grid grid-cols-1 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-12 gap-6">
                                            <Card className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-3">
                                                <ProfilesDesign orgData={orgData} />
                                            </Card>
                                            <Card className="col-span-1 sm:col-span-3 md:col-span-4 lg:col-span-6 xl:col-span-9">
                                                <OrgWalletDetails orgData={orgData} />
                                            </Card>
                                        </div>
                                        :
                                        <Card>
                                            <div className="flex justify-center items-center">
                                                <EmptyListMessage
                                                    message={'No Organization Details Found'}
                                                    description={''}
                                                    buttonContent={''}
                                                />
                                            </div>
                                        </Card>
                                }
                            </div>
                        </div>
                    </div>
            }

        </div>
    );
}


export default PublicOrganizationDetails
