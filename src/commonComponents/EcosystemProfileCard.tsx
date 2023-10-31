import { useEffect, useState } from 'react'
import { Card } from 'flowbite-react';
import type { IEcosystem } from '../components/Ecosystem/interfaces';
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from '../api/Auth';
import { apiStatusCodes, storageKeys } from '../config/CommonConstant';
import type { AxiosResponse } from 'axios';
import { getEcosystems } from '../api/ecosystem';
import CustomAvatar from '../components/Avatar';
import { RoleTablet } from '../components/Ecosystem/Dashboard'
import CustomSpinner from '../components/CustomSpinner';
import { pathRoutes } from '../config/pathRoutes';
import { EmptyListMessage } from '../components/EmptyListComponent';

const EcosystemProfileCard = () => {
    const [ecosystemDetails, setEcosystemDetails] = useState<IEcosystem | null>();
    const [ecosystemList, setEcosystemList] = useState<IEcosystem[] | null>();
    const [loading, setLoading] = useState<boolean>();
    const [ecosystemId, setEcosystemId] = useState<string>();

    const fetchEcosystemDetails = async (ecoId?: string) => {
        setLoading(true);
        try {
            const id = await getFromLocalStorage(storageKeys.ORG_ID);
            const ecosystemId = ecoId || await getFromLocalStorage(storageKeys.ECOSYSTEM_ID);
            console.log(4561, id)
            if (id) {
                const response = await getEcosystems(id);
                setLoading(false)
                const { data } = response as AxiosResponse;
                if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                    setEcosystemList(data?.data)
                    const ecosystemData = data?.data?.find((item: { id: string }) => item.id === ecosystemId);
                    console.log(4545, ecosystemData)
                    if (ecosystemData) {
                        setEcosystemId(ecosystemData?.id)
                        const ecosystemOrg =
                            ecosystemData?.ecosystemOrgs &&
                            ecosystemData?.ecosystemOrgs.length > 0 &&
                            ecosystemData?.ecosystemOrgs[0];
                        const role = ecosystemOrg && ecosystemOrg?.ecosystemRole?.name
                            ? ecosystemOrg?.ecosystemRole?.name
                            : ''
                        await setToLocalStorage(storageKeys.ECOSYSTEM_ROLE, role)
                        setEcosystemDetails({
                            id: ecosystemData?.id,
                            logoUrl: ecosystemData?.logoUrl,
                            name: ecosystemData?.name,
                            description: ecosystemData?.description,
                            joinedDate:
                                ecosystemOrg && ecosystemOrg?.createDateTime
                                    ? ecosystemOrg?.createDateTime
                                    : '',
                            role
                        });
                    } else {
                        await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID);
                    }
                } else {
                    await removeFromLocalStorage(storageKeys.ECOSYSTEM_ID);
                }
            }
        } catch (err) {
            setLoading(false)
        }
        setLoading(false);
    };

    const handleSelectEcosystem = async (e: { target: { value: string; }; }) => {
        await fetchEcosystemDetails(e.target.value)
        await setToLocalStorage(storageKeys.ECOSYSTEM_ID, e.target.value);
        window.location.reload()
    }


    useEffect(() => {
        fetchEcosystemDetails();
    }, []);

    const ecosystemOptions = ecosystemList && ecosystemList.length > 0 && ecosystemList.filter(item => item.id !== ecosystemId)

    return (
        <Card className="m-0">
            {ecosystemDetails ? (
                <div
                    className={`flex flex-wrap items-center`}
                >
                    <div className="mr-4">
                        {ecosystemDetails?.logoUrl ? (
                            <CustomAvatar size="60" src={ecosystemDetails?.logoUrl} />
                        ) : (
                            <CustomAvatar size="70" name={ecosystemDetails?.name} />
                        )}
                    </div>

                    <div className="w-full sm:w-100/22rem min-w-[12rem]">
                        <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">
                            {ecosystemDetails?.name}
                        </h3>
                        <div className="flex items-center">
                            <span className="dark:text-white">Role: </span>{' '}
                            <RoleTablet role={ecosystemDetails?.role || ''} />
                        </div>
                    </div>


                    <div className="inline-flex items-end ml-auto flex-col">
                        {
                            Boolean(ecosystemOptions && ecosystemOptions.length > 0) &&
                            <select
                                className="mb-4 bg-gray-50 sm:min-w-[244px] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                onChange={handleSelectEcosystem}
                            >
                                <option selected>Select Ecosystem</option>
                                {
                                    ecosystemOptions && ecosystemOptions.length > 0 && ecosystemOptions.map(item => (
                                        <option key={item.id} value={item.id}>{item.name}</option>
                                    ))
                                }
                            </select>
                        }
                        <a href={pathRoutes.ecosystem.dashboard} className='flex text-primary-700 dark:text-secondary-700 text-sm font-medium underline-offset-4 hover:underline'>
                            Go to Dashboard
                            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className='h-4 w-4 text-primary-700 dark:text-secondary-700 ml-1'>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"></path>
                            </svg>
                        </a>
                    </div>

                </div>
            ) : !ecosystemDetails && loading ? (
                <CustomSpinner />
            ) :
                <EmptyListMessage
                    message={'No Ecosystem'}
                    description={'Get started by creating a new Ecosystem'}
                    buttonContent={''}
                    svgComponent={<svg className='pr-2 mr-1' xmlns="http://www.w3.org/2000/svg" width="24" height="15" fill="none" viewBox="0 0 24 24">
                        <path fill="#fff" d="M21.89 9.89h-7.78V2.11a2.11 2.11 0 1 0-4.22 0v7.78H2.11a2.11 2.11 0 1 0 0 4.22h7.78v7.78a2.11 2.11 0 1 0 4.22 0v-7.78h7.78a2.11 2.11 0 1 0 0-4.22Z" />
                    </svg>} />
            }
        </Card>
    )
}

export default EcosystemProfileCard