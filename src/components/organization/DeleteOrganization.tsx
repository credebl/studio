import { useEffect, useState } from "react";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import type { AxiosResponse } from "axios";
import {
  deleteOrganization,
  getEcosystems,
  getOrganizationById,
  getOrganizationReferences
} from "../../api/organization";

import BreadCrumbs from "../BreadCrumbs";
import { deleteOrganizationWallet } from "../../api/Agent";
import ConfirmationModal from "../../commonComponents/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getFromLocalStorage, removeFromLocalStorage } from "../../api/Auth";
import { AlertComponent } from "../AlertComponent";
import { pathRoutes } from "../../config/pathRoutes";
import DeleteOrganizationsCard from '../../components/organization/DeleteOrganizationsCard'
import React from "react";
import { deleteVerificationRecords } from '../../api/verification';
import { deleteIssuanceRecords } from '../../api/issuance';
import { deleteConnectionRecords} from '../../api/connection'
import  type { IEcosystemOrganizations, IOrgCount } from "./interfaces";
import { EcosystemRoles } from "../../common/enums";

const DeleteOrganizations = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [organizationData, setOrganizationData] = useState<IOrgCount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [isWalletPresent, setIsWalletPresent] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [deleteAction, setDeleteAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState<string | React.ReactNode>('');
  const [description, setDescription] = useState<string>("");
  const [orgName, setOrgName] = useState<string>("");
  const [ecosystemRoles, setEcosystemRoles] = useState<string[]>([]);
  const [ecosystemUserRoles, setEcosystemUserRoles] = useState<string>('');
  

  const fetchOrganizationDetails = async () => {
    try {
      const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
      const response = await getOrganizationById(orgId as string);
      const { data } = response as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const walletName = data?.data?.org_agents[0]?.walletName;
        const orgName = data?.data?.name;  
        if(orgName){
          setOrgName(orgName)
        }     
        if (walletName) {
          setIsWalletPresent(true);         
        }
        else {
            setIsWalletPresent(false); 
          }
      }
    } catch (error) {
      console.error('Fetch organization details ERROR::::', error);
    }
  };

  const getAllEcosystems = async () => {
    try {
      const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
      const response = await getEcosystems(orgId as string);
      const { data } = response as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) { 
        const ecosystemList = data?.data?.ecosystemList;

        if (ecosystemList && ecosystemList.length > 0) {
          const leadEcosystemNames: string[] = [];
          ecosystemList.forEach((ecosystem: { name: string; ecosystemOrgs: IEcosystemOrganizations[]; }) => {
            ecosystem.ecosystemOrgs.forEach(org => {
              const ecosystemRoleName = org.ecosystemRole?.name;
              if (ecosystemRoleName === EcosystemRoles.ecosystemLead) {
                setEcosystemUserRoles(ecosystemRoleName);
                leadEcosystemNames.push(ecosystem.name);
              }
            });
          });
          setEcosystemRoles(leadEcosystemNames)
        }
      }
    } catch (error) {
      console.error('Fetch organization details ERROR::::', error);
    }
  };

  const fetchOrganizationReferences = async () => {
    setLoading(true);
    try {
      const response = await getOrganizationReferences();
      const { data } = response as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const orgData = data?.data;
        setOrganizationData(orgData);
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrganizationReferences();
    fetchOrganizationDetails();
    getAllEcosystems();
  }, []);

  const deleteHandler = async (deleteFunc: () => Promise<void>) => {
    setDeleteLoading(true);
    try {
      await deleteFunc();
      await fetchOrganizationReferences();

      setShowPopup(false);
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteVerifications = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteVerificationRecords();
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message, {autoClose: 3000})
        await fetchOrganizationReferences();
        setShowPopup(false)
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteIssuance = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteIssuanceRecords();
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message, {autoClose: 3000})
        await fetchOrganizationReferences();
        setShowPopup(false)
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteConnection = async () => {
    setDeleteLoading(true);
    try {
      const response = await deleteConnectionRecords();
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message, {autoClose: 3000})
        await fetchOrganizationReferences();
        setShowPopup(false)
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    setDeleteLoading(false);
  };

  const deleteOrgWallet = async () => {
    try {
      const response = await deleteOrganizationWallet();
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message, {autoClose: 3000})
        setIsWalletPresent(false)
        await fetchOrganizationReferences();
        setTimeout(() => {
          window.location.reload();         
        }, 3000);
        setShowPopup(false)
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
  };

  const deleteOrganizations = async () => {
    try {
      const response = await deleteOrganization();
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message, {autoClose: 3000})
        await fetchOrganizationReferences();
        setShowPopup(false)
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError(error as string);
    }
    await removeFromLocalStorage(storageKeys.ORG_INFO);
		await removeFromLocalStorage(storageKeys.ORG_DETAILS);
        await removeFromLocalStorage(storageKeys.ORG_ROLES);
        await removeFromLocalStorage(storageKeys.ORG_ID);
        setTimeout(() => { 
          window.location.href = pathRoutes.organizations.root;
        }, 3000);

  };

  const deleteFunctions = {
    deleteVerifications,
    deleteIssuance,
    deleteConnection,
    deleteOrgWallet,
    deleteOrganizations
  };

  const cardData = [
    {
      title: "Verifications",
      description: "Verifications is the list of verification records",
      count: organizationData?.verificationRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteVerifications,
      confirmMessage:"Are you sure you want to delete verification records",
      isDisabled: false
    },
    {
      title: "Issuance",
      description: "Issuance is the list of credential records",
      count: organizationData?.issuanceRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteIssuance,
      confirmMessage:"Are you sure you want to delete credential records",
      isDisabled: (organizationData?.verificationRecordsCount ?? 0) > 0
    },
    {
      title: "Connections",
      description: "Connections is the list of connection records",
      count: organizationData?.connectionRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteConnection,
      confirmMessage:"Are you sure you want to delete connection records",
      isDisabled: (organizationData?.issuanceRecordsCount ?? 0) > 0 || (organizationData?.verificationRecordsCount ?? 0) > 0
    },
    {
        title: "Organization wallet",
        description: "Organization Wallet is the data of your created DIDs.",
        count: isWalletPresent ? 1 : 0,
        deleteFunc: deleteFunctions.deleteOrgWallet,
        confirmMessage: "Are you sure you want to delete organization wallet",
        isDisabled:  ecosystemUserRoles.includes(EcosystemRoles.ecosystemLead) ||
          (
            (organizationData?.connectionRecordsCount ?? 0) > 0 ||
            (organizationData?.issuanceRecordsCount ?? 0) > 0 ||
            (organizationData?.verificationRecordsCount ?? 0) > 0) 
          
      },
    {
      title: "Organization",
      description: "Organization is the collection of your users, schemas, cred-defs, connections and wallet.",
      deleteFunc: deleteFunctions.deleteOrganizations,
      confirmMessage:<text>{`Are you sure you want to delete organization `}<text className="font-bold">"{orgName}"</text></text>,     
      isDisabled: isWalletPresent || ecosystemUserRoles.includes(EcosystemRoles.ecosystemLead)
    }
  ];
  return (
    <div className="px-4 pt-2">
      <BreadCrumbs />
      <h1 className="ml-1 mt-2 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white mb-4">
        Delete Organization
      </h1>

      <ToastContainer />
      <AlertComponent
        message={message ?? error}
        type={message ? "success" : "failure"}
        onAlertClose={() => {
          setMessage(null);
          setError(null);
        }}
      />

{ecosystemRoles.length > 0 &&
        <h2 className="mb-4 dark:text-white">
          You are Ecosystem Lead for <strong>{ecosystemRoles.join(', ')}</strong>. You cannot remove yourself from the ecosystem, delete the organization's wallet, and delete your organization.
        </h2>
      }

      {organizationData && (
        <div>
          {cardData.map((card, index) => (
            <DeleteOrganizationsCard
              key={card.title}
              title={card.title}
              description={card.description}
              count={card.count}
              deleteFunc={card.deleteFunc}
              isDisabled={card.isDisabled}
              onDeleteClick={(deleteFunc) => {
                setShowPopup(true);
                setDeleteAction(() => deleteFunc);
                setConfirmMessage(card.confirmMessage);
                setDescription(card.description)
              }}
            />
          ))}

          <ConfirmationModal
            loading={deleteLoading}
            success={message}
            failure={error}
            openModal={showPopup}
            closeModal={() => setShowPopup(false)}
            onSuccess={() => deleteHandler(deleteAction as () => Promise<void>)}
            message={confirmMessage}
            buttonTitles={["No, cancel", "Yes, delete"]}
            isProcessing={deleteLoading}
            setFailure={setError}
            setSuccess={setMessage}
            warning={description}
          />
        </div>
      )}
    </div>
  );
};

export default DeleteOrganizations;