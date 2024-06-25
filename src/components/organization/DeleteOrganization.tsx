import { useEffect, useState } from "react";
import { apiStatusCodes, storageKeys } from "../../config/CommonConstant";
import type { AxiosResponse } from "axios";
import {
  deleteConnectionRecords,
  deleteIssuanceRecords,
  deleteOrganization,
  deleteVerificationRecords,
  getOrganizationById,
  getOrganizationReferences
} from "../../api/organization";
import { deleteOrganizationFromEcosystem, getEcosystems } from "../../api/ecosystem";

import BreadCrumbs from "../BreadCrumbs";
import { deleteOrganizationWallet } from "../../api/Agent";
import ConfirmationModal from "../../commonComponents/ConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getFromLocalStorage, removeFromLocalStorage } from "../../api/Auth";
import { EcosystemRoles } from "../../common/enums";
import { AlertComponent } from "../AlertComponent";
import { pathRoutes } from "../../config/pathRoutes";
import DeleteOrganizationsCard from './DeleteOrganizationsCard'

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
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [isWalletPresent, setIsWalletPresent] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [ecosystemUserRoles, setEcosystemUserRoles] = useState<string>('');
  const [deleteAction, setDeleteAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [description, setDescription] = useState<string>("");

  interface IEcosystemRole {
    id: string;
    name: string;
    description: string;
    createDateTime: string;
    lastChangedDateTime: string;
    deletedAt: string | null;
  }

  interface EcosystemOrgs {
    id: string;
    orgId: string;
    status: string;
    createDateTime: string;
    lastChangedDateTime: string;
    ecosystemId: string;
    ecosystemRoleId: string;
    ecosystemRole: IEcosystemRole;
  }

  const getAllEcosystems = async () => {
    try {
      const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
      const response = await getEcosystems(orgId as string);
      const { data } = response as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) { 
        const ecosystemList = data?.data?.ecosystemList;

        if (ecosystemList && ecosystemList.length > 0) {
          ecosystemList.forEach((ecosystem: { ecosystemOrgs: EcosystemOrgs[]; }) => {
            ecosystem.ecosystemOrgs.forEach(org => {
              const ecosystemRoleName = org.ecosystemRole?.name;
              if (ecosystemRoleName === EcosystemRoles.ecosystemLead) {
                setEcosystemUserRoles(ecosystemRoleName);
              }
            });
          });
        }
      }
    } catch (error) {
      console.error('Fetch organization details ERROR::::', error);
    }
  };

  const fetchOrganizationDetails = async () => {
    try {
      const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
      const response = await getOrganizationById(orgId as string);
      const { data } = response as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const walletName = data?.data?.org_agents[0]?.walletName;
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
      setError('An unexpected error occurred');
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
      setError('An unexpected error occurred');
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
      setError('An unexpected error occurred');
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
      setError('An unexpected error occurred');
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
      setError('An unexpected error occurred');
    }
    setDeleteLoading(false);
  };

  const deleteOrgFromEcosystem = async () => {
    try {
      const response = await deleteOrganizationFromEcosystem();
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
      setError('An unexpected error occurred');
    }
  };

  const deleteOrgWallet = async () => {
    try {
      const response = await deleteOrganizationWallet();
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        toast.success(data?.message, {autoClose: 3000})
        setIsWalletPresent(false)
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
        toast.success(data?.message, {autoClose: 3000})
        await fetchOrganizationReferences();
        setShowPopup(false)
      } else {
        setError(response as string);
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setError('An unexpected error occurred');
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
    deleteOrgFromEcosystem,
    deleteOrgWallet,
    deleteOrganizations
  };

  const cardData = [
    {
      title: "Verifications",
      description: "Verifications is the list of verified Credentials",
      count: organizationData?.verificationRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteVerifications,
      confirmMessage:"Are you sure you want to delete Verification records",
      isDisabled: false
    },
    {
      title: "Issuance",
      description: "Issuance is the list of Credentials",
      count: organizationData?.issuanceRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteIssuance,
      confirmMessage:"Are you sure you want to delete issuance records",
      isDisabled: (organizationData?.verificationRecordsCount ?? 0) > 0
    },
    {
      title: "Connections",
      description: "Connections is the list of connections",
      count: organizationData?.connectionRecordsCount ?? 0,
      deleteFunc: deleteFunctions.deleteConnection,
      confirmMessage:"Are you sure you want to delete connection records",
      isDisabled: (organizationData?.issuanceRecordsCount ?? 0) > 0 || (organizationData?.verificationRecordsCount ?? 0) > 0
    },
    {
      title: "Ecosystem members",
      description: "Ecosystem members",
      count: organizationData?.orgEcosystemsCount ?? 0,
      deleteFunc: deleteFunctions.deleteOrgFromEcosystem,
      confirmMessage:"Are you sure you want to remove your organization from eocystem",
      isDisabled: ecosystemUserRoles.includes(EcosystemRoles.ecosystemLead) || ((organizationData?.connectionRecordsCount ?? 0) > 0 ||(organizationData?.issuanceRecordsCount ?? 0) > 0 || (organizationData?.verificationRecordsCount ?? 0) > 0)
    },
    {
        title: "Organization wallet",
        description: "Organization wallet",
        count: isWalletPresent ? 1 : 0,
        deleteFunc: deleteFunctions.deleteOrgWallet,
        confirmMessage: "Are you sure you want to delete organization wallet",
        isDisabled: ecosystemUserRoles.includes(EcosystemRoles.ecosystemLead) ||
          ((organizationData?.orgEcosystemsCount ?? 0) > 0 ||
            (organizationData?.connectionRecordsCount ?? 0) > 0 ||
            (organizationData?.issuanceRecordsCount ?? 0) > 0 ||
            (organizationData?.verificationRecordsCount ?? 0) > 0) 
          
      },
    {
      title: "Organization",
      description: "Organization",
      deleteFunc: deleteFunctions.deleteOrganizations,
      confirmMessage:"Are you sure you want to delete organization",     
      isDisabled: isWalletPresent || ecosystemUserRoles.includes(EcosystemRoles.ecosystemLead)
    }
  ];
  return (
    <div>
      <BreadCrumbs />
      <h1 className="ml-1 mr-auto text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
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