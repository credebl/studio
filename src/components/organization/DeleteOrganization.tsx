import { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import { apiStatusCodes } from "../../config/CommonConstant";
import type { AxiosResponse } from "axios";
import { deleteConnectionRecords, deleteIssuanceRecords, deleteOrganization, deleteVerificationRecords, getOrganizationReferences } from "../../api/organization";
import {deleteOrganizationFromEcosystem } from "../../api/ecosystem";

import BreadCrumbs from "../BreadCrumbs";
import { deleteOrganizationWallet } from "../../api/Agent";
import ConfirmationModal from "../../commonComponents/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface OrgCount {
    verificationRecordsCount: number;
    connectionRecordsCount: number;
    issuanceRecordsCount: number;
    orgEcosystemsCount: number;
    orgInvitationsCount: number;
    orgUsersCount: number;
}

const DeleteOrganizations = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [organizationData, setOrganizationData] = useState<OrgCount | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false)
    const [selectedInvitation, setSelectedInvitation] = useState<string>('')
    const [message, setMessage] = useState<string | null>(null)
    const [showPopup, setShowPopup] = useState<boolean>(false)
		const [roles, setRoles] = useState<string[]>([]);

    const fetchOrganizationReferences = async () => {
        setLoading(true);
        try {
            const response = await getOrganizationReferences();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                console.log("data", data);
                const orgData = data?.data;
                setOrganizationData(orgData);
            } else {
                setError(response as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred');
        }
        setLoading(false);
    };

    const deleteVerifications = async () => {
		  	setDeleteLoading(true);

        try {
            const response = await deleteVerificationRecords();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
		  	setDeleteLoading(true);
                toast.success(data?.message)
                toast.error(response as string)
                // Refresh organization data to reflect changes
              await fetchOrganizationReferences();
              setShowPopup(false)

            } else {
                setError(response as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred');
		  	setDeleteLoading(false);

        }
		  	setDeleteLoading(false);
    };

    const deleteIssuance = async () => {
        setDeleteLoading(true);
        try {
            const response = await deleteIssuanceRecords();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setDeleteLoading(true);
                toast.success(data?.message)
                toast.error(response as string)
                // Refresh organization data to reflect changes
                await fetchOrganizationReferences();
                setShowPopup(false)

            } else {
                setError(response as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred');
            setDeleteLoading(false);

        }
        setDeleteLoading(false);
    };


    const deleteConnection = async () => {
        setDeleteLoading(true);
        try {
            const response = await deleteConnectionRecords();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                setDeleteLoading(true);
                toast.success(data?.message)
                toast.error(response as string)
                // Refresh organization data to reflect changes
                await fetchOrganizationReferences();
                setShowPopup(false)

            } else {
                setError(response as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred');
            setDeleteLoading(false);

        }
        setDeleteLoading(false);
    };

    const deleteOrgFromEcosystem = async () => {
        try {
            const response = await deleteOrganizationFromEcosystem();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                toast.success(data?.message)
                toast.error(response as string)
                // Refresh organization data to reflect changes
              await fetchOrganizationReferences();
              setShowPopup(false)

            } else {
                setError(response as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred');
        }
    };

    const deleteOrgWallet = async () => {
        try {
            const response = await deleteOrganizationWallet();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                toast.success(data?.message)
                toast.error(response as string)
                // Refresh organization data to reflect changes
              await fetchOrganizationReferences();
              setShowPopup(false)

            } else {
                setError(response as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred');
        }
    };


    const deleteOrganizations = async () => {
        try {
            const response = await deleteOrganization();
            const { data } = response as AxiosResponse;

            if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                toast.success(data?.message)
                toast.error(response as string)
                // Refresh organization data to reflect changes
              await fetchOrganizationReferences();
              setShowPopup(false)

            } else {
                setError(response as string);
            }
        } catch (error) {
            console.error('An error occurred:', error);
            setError('An unexpected error occurred');
        }
    };



    useEffect(() => {
        fetchOrganizationReferences();
    }, []);


    return (
        <div>
            <BreadCrumbs />

            <h1 className="ml-1 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Delete Organization
            </h1>

            {message && <p className="text-green-500">{message}</p>}
            {error && <p className="text-red-500">{error}</p>}
<ToastContainer/>
            {organizationData && (
                <div>
                    { organizationData.verificationRecordsCount > 0 && 
                        <Card>
                        <div className="flex flex-wrap w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                            <p>
                                <p className="text-lg font-bold">Verifications</p>
                                <p>Verifications is the list of verified Credentials</p>
                                <p>Total: {organizationData.verificationRecordsCount}</p>
                            </p>
                            <button onClick={()=>{
                                setShowPopup(true)
                            }}>
                                <img src="/images/delete_24dp_FILL0_wght400_GRAD0_opsz24 1.svg" width={25} height={25} alt="" />
                            </button>
                        </div>
                    </Card>
                    }
                    { organizationData.issuanceRecordsCount > 0 && 
                    <Card >
                        
                        <div className="flex flex-wrap w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                            <p>
                                <p className="text-lg font-bold">Issuance</p>
                                <p>Issuance is the list of Credentials</p>
                                <p>Total: {organizationData.issuanceRecordsCount}</p>
                            </p>
                            <button onClick={()=>{
                                setShowPopup(true)
                            }}>
                                <img src="/images/delete_24dp_FILL0_wght400_GRAD0_opsz24 1.svg" width={25} height={25} alt="" />
                            </button>
                        </div>
                    </Card>

                    }
                    {
                        organizationData.connectionRecordsCount > 0 &&
                    <Card>
                        <div className="flex flex-wrap w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                            <p>
                                <p className="text-lg font-bold">Connections</p>
                                <p>Connections is the list of connections</p>
                                <p>Total: {organizationData.connectionRecordsCount}</p>
                            </p>
                                    <button onClick={() => {
                                        setShowPopup(true)

                                    }}>
                                <img src="/images/delete_24dp_FILL0_wght400_GRAD0_opsz24 1.svg" width={25} height={25} alt="" />
                            </button>
                        </div>
                    </Card>
                    }
                    {
                    organizationData.orgEcosystemsCount > 0 &&
                    <Card>
                        <div className="flex flex-wrap w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                            <p>
                                <p className="text-lg font-bold">Ecosystem members</p>
                                <p>Ecosystem members</p>
                                <p>Total: {organizationData.orgUsersCount}</p>
                            </p>
                            <button onClick={deleteOrgFromEcosystem}>
                                <img src="/images/delete_24dp_FILL0_wght400_GRAD0_opsz24 1.svg" width={25} height={25} alt="" />
                            </button>
                        </div>
                    </Card>
                    }
                    <Card>
                        <div className="flex flex-wrap w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                            <p>
                                <p className="text-lg font-bold">Organization wallet</p>
                                <p>Organization wallet</p>
                            </p>
                            <button onClick={() => {

                                setShowPopup(true)

                                }}>
                                <img src="/images/delete_24dp_FILL0_wght400_GRAD0_opsz24 1.svg" width={25} height={25} alt="" />
                            </button>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex flex-wrap w-full items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex-row sm:items-center sm:w-full sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                            <p>
                                <p className="text-lg font-bold">Organization</p>
                                <p>Organization</p>
                            </p>
                            <button onClick={deleteOrganizations}>
                                <img src="/images/delete_24dp_FILL0_wght400_GRAD0_opsz24 1.svg" width={25} height={25} alt="" />
                            </button>
                        </div>
                    </Card>
                    <ConfirmationModal
					loading={deleteLoading}
                    success={message}
                    failure={error}
                    openModal={showPopup}
                    closeModal={() => setShowPopup(false)}
                    onSuccess={() => deleteVerifications()}
                    message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
                    buttonTitles={["No, cancel", "Yes, I'm sure"]}
                    isProcessing={deleteLoading}
                    setFailure={setError}
                    setSuccess={setMessage}
                /> 
                <ConfirmationModal
                loading={deleteLoading}
                success={message}
                failure={error}
                openModal={showPopup}
                closeModal={() => setShowPopup(false)}
                onSuccess={() => deleteIssuance()}
                message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
                buttonTitles={["No, cancel", "Yes, I'm sure"]}
                isProcessing={deleteLoading}
                setFailure={setError}
                setSuccess={setMessage}
            />
             

             <ConfirmationModal
                loading={deleteLoading}
                success={message}
                failure={error}
                openModal={showPopup}
                closeModal={() => setShowPopup(false)}
                onSuccess={() => deleteConnection()}
                message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
                buttonTitles={["No, cancel", "Yes, I'm sure"]}
                isProcessing={deleteLoading}
                setFailure={setError}
                setSuccess={setMessage}
            />

<ConfirmationModal
                loading={deleteLoading}
                success={message}
                failure={error}
                openModal={showPopup}
                closeModal={() => setShowPopup(false)}
                onSuccess={() => deleteOrgFromEcosystem()}
                message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
                buttonTitles={["No, cancel", "Yes, I'm sure"]}
                isProcessing={deleteLoading}
                setFailure={setError}
                setSuccess={setMessage}
            />

<ConfirmationModal
                loading={deleteLoading}
                success={message}
                failure={error}
                openModal={showPopup}
                closeModal={() => setShowPopup(false)}
                onSuccess={() => deleteOrgWallet()}
                message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
                buttonTitles={["No, cancel", "Yes, I'm sure"]}
                isProcessing={deleteLoading}
                setFailure={setError}
                setSuccess={setMessage}
            />

<ConfirmationModal
                loading={deleteLoading}
                success={message}
                failure={error}
                openModal={showPopup}
                closeModal={() => setShowPopup(false)}
                onSuccess={() => deleteOrganizations()}
                message={'Would you like to proceed? Keep in mind that this action cannot be undone.'}
                buttonTitles={["No, cancel", "Yes, I'm sure"]}
                isProcessing={deleteLoading}
                setFailure={setError}
                setSuccess={setMessage}
            />
                
                </div>
            )}
        </div>
    );
};

export default DeleteOrganizations;
