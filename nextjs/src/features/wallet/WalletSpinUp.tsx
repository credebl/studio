'use client';

import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { nanoid } from 'nanoid';
import React from 'react';
import { createDid, createOrganization, getOrganizationById, setAgentConfigDetails, spinupSharedAgent } from '@/app/api/organization';
import { apiStatusCodes, storageKeys } from '@/config/CommonConstant';
import { DidMethod } from '../common/enum';
import SOCKET from '@/config/SocketConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User, Users } from "lucide-react";
import DedicatedAgentForm from './DedicatedAgentForm';
import WalletSteps from './WalletSteps';
import SharedAgentForm from './SharedAagentForm';
import Stepper from '../common/stepperComponent';
import PageContainer from '@/components/layout/page-container';
import { useRouter } from 'next/navigation';

// Define types and interfaces
export interface IValuesShared {
  keyType?: string;
  seed: string;
  method: string;
  network?: string;
  did?: string;
  endorserDid?: string;
  privatekey?: string;
  endpoint?: string;
  domain?: string;
  role?: string;
  ledger: string;
  label?: string;
}

interface Values {
  seed: string;
  walletName: string;
  password: string;
  did: string;
  network: string;
}

export interface IDedicatedAgentData {
  walletName: string;
  agentEndpoint: string;
  apiKey: string;
  seed: string;
  keyType: string;
  method: string;
  network: string;
  role: string;
}

interface Organisation {
  [key: string]: any;
}

interface OrganizationFormDetails {
  name: string;
  description: string;
  countryId?: number | null;
  stateId?: number | null;
  cityId?: number | null;
  website: string;
  logoUrl?: File | null;
}

enum AgentType {
  SHARED = 'shared',
  DEDICATED = 'dedicated',
}

interface WalletSpinupProps {
  step: number;
  orgId?: string | null;
  formData: OrganizationFormDetails | null;
  setWalletSpinupStatus: (flag: boolean) => void;
  ledgerConfig: boolean;
  setAgentConfigDetails?: IDedicatedAgentData;
  orgName?: string;
}

// // Stepper component using shadcn/ui Progress
// const Stepper = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
//   const progress = (currentStep / totalSteps) * 100;
  
//   return (
//     <div className="w-full mb-6">
//       <Progress value={progress} className="h-2" />
//       <div className="flex justify-between mt-2 text-xs text-gray-500">
//         {Array.from({ length: totalSteps }).map((_, i) => (
//           <div key={i} className={`${i < currentStep ? 'text-primary font-medium' : ''}`}>
//             Step {i + 1}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

const WalletSpinup = (props: WalletSpinupProps) => {
  const [agentType, setAgentType] = useState<string>(AgentType.DEDICATED);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletSpinStep, setWalletSpinStep] = useState<number>(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [agentSpinupCall, setAgentSpinupCall] = useState<boolean>(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [seeds, setSeeds] = useState<string>('');
  const [maskedSeeds, setMaskedSeeds] = useState('');
  const [orgData, setOrgData] = useState<Organisation | null>(null);
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    description: '',
    countryId: null,
    stateId: null,
    cityId: null,
    website: '',
    logoUrl: null,
  });
  
  const [showProgressUI, setShowProgressUI] = useState(false);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [isConfiguredDedicated, setIsConfiguredDedicated] = useState<boolean>(false);
  const [showLedgerConfig, setShowLedgerConfig] = useState(false);
  const [logoImage, setLogoImage] = useState<{ imagePreviewUrl: string | null }>({ imagePreviewUrl: null });
  const [errMsg, setErrMsg] = useState('');

  // Add state to store the created organization ID
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
  const [orgIdOfCurrentOrg, setOrgIdOfCurrentOrg] = useState<string | null>(null);
const alreadyCreatedOrgId = props.orgId
  const router = useRouter();

  const [agentConfig, setAgentConfig] = useState({
    walletName: '',
    agentEndpoint: '',
    apiKey: ''
  });
  
  const maskSeeds = (seed: string) => {
    const visiblePart = seed.slice(0, -10);
    const maskedPart = seed.slice(-10).replace(/./g, '*');
    return visiblePart + maskedPart
  };
  
  useEffect(() => {
    const generatedSeeds = nanoid(32);
    const masked = maskSeeds(generatedSeeds);
    setSeeds(generatedSeeds);
    setMaskedSeeds(masked);
  }, []);

  // Get redirect URL param
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('redirectTo');
    }
    return null;
  };
  
  const redirectUrl = getRedirectUrl();

  // Unified organization creation function
  // const createOrganizationOnce = async () => {
  //   // If we already created an org, use that ID
  //   console.log("innn org create functionnnnnn");

  //   if (alreadyCreatedOrgId) {
  //     // Org ID already provided via props (existing org), skip creation
  //     setCreatedOrgId(alreadyCreatedOrgId);
      
  //     try {
  //       const response = await getOrganizationById(props.orgId as string);
  //       const { data } = response as AxiosResponse;
  //       console.log("🚀 ~ here i am .....", data)
  //       setLoading(false);
  
  //       if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
  //         const org = data.data;

  //         const orgData = {
  //           name: org.name || '',
  //           description: org.description || '',
  //           countryId: org.countryId || null,
  //           stateId: org.stateId || null,
  //           cityId: org.cityId || null,
  //           website: org.website || '',
  //           logoUrl: org.logoUrl || null,
  //         };
  
  //         // Optional: Save to localStorage
  //         // await setToLocalStorage(storageKeys.ORG_ID, props.orgId);
  
  //         // ✅ Set form state with fetched org values
  //         setOrgFormData(orgData);
  
  //         return props.orgId;
  //       } else {
  //         setFailure("Failed to fetch organization details");
  //         return null;
  //       }
  //     } catch (err) {
  //       setFailure("Error fetching organization details");
  //       console.error(err);
  //       setLoading(false);
  //       return null;
  //     }
  //   }

  //   console.log("🚀 ~ createOrganizationOnce ~ createdOrgId:", createdOrgId)
    
  //   // if (createdOrgId) {
  //   //   return createdOrgId;
  //   // }
    
  //   if (!props.formData) {
  //     setFailure("Organization data is missing");
  //     return null;
  //   }

  //   setLoading(true);
  //   try {
  //     const orgData = {
  //       name: props.formData.name,
  //       description: props.formData.description,
  //       logo: props.formData.logoUrl ? URL.createObjectURL(props.formData.logoUrl) : '',
  //       website: props.formData.website || '',
  //       countryId: props.formData.countryId,
  //       stateId: props.formData.stateId,
  //       cityId: props.formData.cityId,
  //     };

  //     const resCreateOrg = await createOrganization(orgData);
  //     const { data } = resCreateOrg as AxiosResponse;

  //     if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
  //       const orgId = data?.data?.id || data?.data?._id;
  //       console.log("🚀 ~ createOrganizationOnce ~ orgId:", orgId)
  //       setOrgIdOfCurrentOrg(orgId)
  //       setCreatedOrgId(orgId); // Store the ID in state
  //       setSuccess("Organization created successfully");
  //       return orgId;
  //     } else {
  //       setFailure(typeof resCreateOrg === 'string' ? resCreateOrg : "Failed to create organization");
  //       return null;
  //     }
  //   } catch (error: any) {
  //     setFailure("Error creating organization");
  //     console.error("Error creating organization:", error);
  //     return null;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const createOrganizationOnce = async () => {
    console.log("In org create function");
  
    // If we have an existing org ID from props, fetch its details
    if (alreadyCreatedOrgId) {
      console.log("Using existing org ID from props:", alreadyCreatedOrgId);
      setCreatedOrgId(alreadyCreatedOrgId);
      
      try {
        const response = await getOrganizationById(alreadyCreatedOrgId as string);
        const { data } = response as AxiosResponse;
        
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          const org = data.data;
  
          // Store the org details in state
          const orgData = {
            name: org.name || '',
            description: org.description || '',
            countryId: org.countryId || null,
            stateId: org.stateId || null,
            cityId: org.cityId || null,
            website: org.website || '',
            logoUrl: org.logoUrl || null,
          };
  
          setOrgFormData(orgData);
          return alreadyCreatedOrgId;
        } else {
          setFailure("Failed to fetch organization details");
          return null;
        }
      } catch (err) {
        setFailure("Error fetching organization details");
        console.error(err);
        return null;
      }
    }
  
    // If we don't have an existing org ID, check if we have form data to create one
    if (!props.formData) {
      setFailure("Organization data is missing");
      return null;
    }
  
    // Create new organization
    setLoading(true);
    try {
      const orgData = {
        name: props.formData.name,
        description: props.formData.description,
        logo: props.formData.logoUrl ? URL.createObjectURL(props.formData.logoUrl) : '',
        website: props.formData.website || '',
        countryId: props.formData.countryId,
        stateId: props.formData.stateId,
        cityId: props.formData.cityId,
      };
  
      const resCreateOrg = await createOrganization(orgData);
      const { data } = resCreateOrg as AxiosResponse;
  
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        const orgId = data?.data?.id || data?.data?._id;
        console.log("Created new org with ID:", orgId);
        setOrgIdOfCurrentOrg(orgId);
        setCreatedOrgId(orgId);
        setSuccess("Organization created successfully");
        return orgId;
      } else {
        setFailure(typeof resCreateOrg === 'string' ? resCreateOrg : "Failed to create organization");
        return null;
      }
    } catch (error: any) {
      setFailure("Error creating organization");
      console.error("Error creating organization:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const configureDedicatedWallet = () => {
    setIsConfiguredDedicated(true);
    setShowLedgerConfig(true); // Show ledger config when dedicated wallet is configured
  };
  
  const fetchOrganizationDetails = async () => {
    setLoading(true);
    const orgId = alreadyCreatedOrgId;
    // const orgInfoData = await getFromLocalStorage(storageKeys.ORG_INFO);
    const response = await getOrganizationById(orgId as string);
    const { data } = response as AxiosResponse;
    setLoading(false);
    
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {

      const org = data.data;

      const orgData = {
        name: org.name || '',
        description: org.description || '',
        countryId: org.countryId || null,
        stateId: org.stateId || null,
        cityId: org.cityId || null,
        website: org.website || '',
        logoUrl: org.logoUrl || null,
      };
      const agentData = data?.data?.org_agents;
      setOrgFormData(orgData);
      if (data?.data?.org_agents && data?.data?.org_agents[0]?.org_agent_type?.agent?.toLowerCase() === AgentType.DEDICATED) {
        setIsConfiguredDedicated(true);
        setAgentType(AgentType.DEDICATED);
      }
      
      if (agentData && agentData.length > 0 && data?.data?.orgDid) {
        setOrgData(data?.data);
      }
    }
  };

  useEffect(() => {
    const shouldFetchOrg = async () => {
      const localOrgId = await getFromLocalStorage(storageKeys.ORG_ID);
      if (!createdOrgId && !props.orgId && localOrgId) {
        await fetchOrganizationDetails();
      }
    };
    shouldFetchOrg();
    fetchOrganizationDetails();
  }, []);

  const onRadioSelect = (type: string) => {
    setAgentType(type);
  };

  const submitDedicatedWallet = async (
    values: IValuesShared,
    privatekey: string,
    domain: string
  ) => {
    setShowProgressUI(true);
    setAgentSpinupCall(true);
    setWalletSpinStep(1);
    // Use the unified organization creation function
    const orgId = await createOrganizationOnce();
    if (!orgId) return; // Stop if organization creation failed

    const agentPayload = {
      walletName: agentConfig.walletName,
      apiKey: agentConfig.apiKey,
      agentEndpoint: agentConfig.agentEndpoint,
    };
    
    try {
      const spinupRes = await setAgentConfigDetails(agentPayload, orgId);
      console.log("spinupRes++++++++++++++", spinupRes)
      const { data: agentData } = spinupRes as AxiosResponse;
    
      if (agentData?.statusCode !== apiStatusCodes.API_STATUS_CREATED) {
        setFailure("Failed to configure dedicated agent");
        setLoading(false);
        return;
      }
    } catch (err) {
      setFailure("Error configuring dedicated agent");
      setLoading(false);
      console.error(err);
      return;
    }
    
    const didData = {
      seed: values.method === DidMethod.POLYGON ? '' : seeds,
      keyType: values.keyType || 'ed25519',
      method: values.method.split(':')[1] || '',
      network:
        values.method === DidMethod.INDY ?
        values.network?.split(':').slice(2).join(':') :
          values.method === DidMethod.POLYGON
            ? values.network?.split(':').slice(1).join(':') 
            : '',
      domain: values.method === DidMethod.WEB ? domain : '',
      role: values.method === DidMethod.INDY ? 'endorser' : '',
      privatekey: values.method === DidMethod.POLYGON ? privatekey : '',
      did: values.did || '',
      endorserDid: values?.endorserDid || '',
      isPrimaryDid: true,
      clientSocketId: SOCKET.id,
    };
    
    console.log("111111111111111111111111111111", didData)
    // setLoading(true);
    
    const spinupRes = await createDid(orgId as string, didData);
    const { data } = spinupRes as AxiosResponse;
    console.log("🚀dedicated agent crate did+++++++++++++++++:", data)
    
    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setAgentSpinupCall(true);
      setSuccess(spinupRes as string);
      setWalletSpinStep(1); 

      setTimeout(() => {
        // setWalletSpinStep(6);
        // props.setWalletSpinupStatus(true);
        window.location.href = redirectUrl ? redirectUrl : '/organizations';  // Add this redirection
      }, 1000);
    } else {
      setShowProgressUI(false);
      setLoading(false);
      setFailure(spinupRes as string);
    }
  };

  const submitSharedWallet = async (
    values: IValuesShared,
    domain: string,
  ) => {
    console.log(" we are here");

    // Use the unified organization creation function
    const orgId = await createOrganizationOnce();
    setCreatedOrgId(orgId)
    console.log("🚀 ~ WalletSpinup ~ orgId:44444444", orgId)
    if (!orgId) return; // Stop if organization creation failed
    
    setLoading(true);
    const ledgerName = values?.network?.split(":")[2];
    const network = values?.network?.split(":").slice(2).join(":");
    const polygonNetwork = values?.network?.split(":").slice(1).join(":");
  
    const payload = {
      keyType: values.keyType || 'ed25519',
      method: values.method.split(':')[1] || '',
      ledger: values.method === DidMethod.INDY ? ledgerName : '',
      label: values.label,
      privatekey: values.method === DidMethod.POLYGON ? values?.privatekey : '',
      seed: values.method === DidMethod.POLYGON ? '' : values?.seed || seeds,
      network:
        values.method === DidMethod.POLYGON
          ? polygonNetwork
          : network,
      domain: values.method === DidMethod.WEB ? domain : '',
      role: values.method === DidMethod.INDY ? values?.role ?? 'endorser' : '',
      did: values?.did ?? '',
      endorserDid: values?.endorserDid ?? '',
      clientSocketId: SOCKET.id,
    };
    console.log("🚀 ~ WalletSpinup ~ payload.SOCKET.id:", SOCKET.id)
    
    try {
      console.log("🚀 ~ WalletSpinup ~ payload:555555", payload)
      // Use the orgId directly - we know it exists at this point
      const spinupRes = await spinupSharedAgent(payload, orgId);
      
      const { data } = spinupRes as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        // Don't setLoading(false) here because we'll wait for socket events to complete
        
        if (data?.data['agentSpinupStatus'] === 1) {
          setAgentSpinupCall(true);
          setIsShared(true);
          // Success will be shown through socket events
        } else {
          setLoading(false);
          setFailure(spinupRes as string);
        }
      } else {
        setLoading(false);
        setFailure(spinupRes as string);
      }
    } catch (error: any) {
      console.error("Error creating shared agent:", error);
      setLoading(false);
      setFailure("Error creating shared agent: " + (error.message || "Unknown error"));
    }
  };

  // Setup socket event listeners with cleanup
  useEffect(() => {
    // Socket event listeners
    const setupSocketListeners = () => {
      SOCKET.on('agent-spinup-process-initiated', () => {
        console.log(`agent-spinup-process-initiated`);
        setWalletSpinStep(1);
      });

      SOCKET.on('agent-spinup-process-completed', (data: any) => {
        console.log(`agent-spinup-process-completed`, JSON.stringify(data));
        setWalletSpinStep(2);
      });

      SOCKET.on('did-publish-process-initiated', (data: any) => {
        console.log(`did-publish-process-initiated`, JSON.stringify(data));
        setWalletSpinStep(3);
      });

      SOCKET.on('did-publish-process-completed', (data: any) => {
        console.log(`did-publish-process-completed`, JSON.stringify(data));
        setWalletSpinStep(4);
      });

      SOCKET.on('invitation-url-creation-started', (data: any) => {
        console.log(` invitation-url-creation-started`, JSON.stringify(data));
        setTimeout(() => {
          setWalletSpinStep(5);
        }, 1000);
      });

      SOCKET.on('invitation-url-creation-success', (data: any) => {
        setLoading(false);
        setTimeout(() => {
          setWalletSpinStep(6);
          props.setWalletSpinupStatus(true);
        }, 1000);
        console.log('createdOrgId::', createdOrgId)
        router.push('/organizations')
        console.log(`invitation-url-creation-success`, JSON.stringify(data));
      });
      
      SOCKET.on('error-in-wallet-creation-process', (data) => {
        setLoading(false);
        setTimeout(() => {
          setFailure('Wallet Creation Failed');
        }, 5000);
        console.log(`error-in-wallet-creation-process`, JSON.stringify(data));
      });
    };

    setupSocketListeners();

    // Clean up socket listeners on unmount
    return () => {
      SOCKET.off('agent-spinup-process-initiated');
      SOCKET.off('agent-spinup-process-completed');
      SOCKET.off('did-publish-process-initiated');
      SOCKET.off('did-publish-process-completed');
      SOCKET.off('invitation-url-creation-started');
      SOCKET.off('invitation-url-creation-success');
      SOCKET.off('error-in-wallet-creation-process');
    };
  }, []);

  const generateAlphaNumeric = props?.orgName
    ? props?.orgName
        ?.split(' ')
        .reduce(
          (s, c) =>
            s.charAt(0).toUpperCase() +
            s.slice(1) +
            (c.charAt(0).toUpperCase() + c.slice(1)),
          '',
        )
    : '';

  const orgName = generateAlphaNumeric.slice(0, 19);

  let formComponent;

  if (!agentSpinupCall) {
    if (agentType === AgentType.SHARED) {
      formComponent = (
        <SharedAgentForm
          ledgerConfig={showLedgerConfig}
          setLedgerConfig={setShowLedgerConfig}
          maskedSeeds={maskedSeeds}
          seeds={seeds}
          orgName={orgName}
          loading={loading}
          submitSharedWallet={submitSharedWallet}
          isCopied={false}
        />
      );
    } else {
      formComponent = (
        <DedicatedAgentForm
          ledgerConfig={showLedgerConfig}
          setLedgerConfig={setShowLedgerConfig}
          seeds={seeds}
          maskedSeeds={maskedSeeds}
          loading={loading}
          onConfigureDedicated={configureDedicatedWallet}
          submitDedicatedWallet={submitDedicatedWallet}
          setAgentConfig={setAgentConfig}
        />
      );
    }
  } else {
    if (agentType === AgentType.SHARED) {
      formComponent = (
        <>
          <Stepper currentStep={4} totalSteps={4} />
          <WalletSteps steps={walletSpinStep} />
        </>
      );
    } else {
      formComponent = (
        <>
          <Stepper currentStep={4} totalSteps={4} />
          <WalletSteps steps={walletSpinStep} />
        </>
      );
    }
  }

  console.log("🚀 ~ SOCKET.on ~ createdOrgId--------:", createdOrgId)


  return (
<div className="">
      <div className="mx-auto mt-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Alert Messages */}
              {success && (
                <Alert variant="default" className="bg-background text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              
              {failure && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{failure}</AlertDescription>
                </Alert>
              )}
              
              {/* Header section - hide when showing ledger config */}
              {!showLedgerConfig && (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h1 className="text-2xl font-semibold">Agent Setup</h1>
                      <p className="text-muted-foreground">Configure your digital agent</p>
                    </div>

                    {/* Step X of Y at Top Right */}
                    <div className="text-muted-foreground text-sm font-medium">
                      Step {props.step} of 4
                    </div>
                  </div>

                  {/* Stepper Progress Bar */}
                  <Stepper currentStep={props.step} totalSteps={4} />
                </>
              )}
        
              <div className="w-full">
              {!showLedgerConfig && !agentSpinupCall && (
						<div className="mb-6">
							<h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">Agent Type</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Dedicated Agent Card */}
								<div 
									className={` rounded-lg p-5 cursor-pointer ${
										agentType === AgentType.DEDICATED 
											? 'border-yellow-500' 
											: 'border-gray-200 hover:border-gray-300'
									}`}
									onClick={() => onRadioSelect(AgentType.DEDICATED)}
								>
									<div className="flex items-start">
										<input
											id="dedicated-agent-radio"
											type="radio"
											value={AgentType.DEDICATED}
											checked={agentType === AgentType.DEDICATED}
											onChange={() => onRadioSelect(AgentType.DEDICATED)}
											name="agent-type"
											className="w-4 h-4 mt-1 text-yellow-500 bg-gray-100 border-gray-300"
										/>
										<div className="ml-3 flex justify-end w-full">
											
											<div className="bg-yellow-100 rounded-full p-2">
												<svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
													<path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
												</svg>
											</div>
										</div>
									</div>
									<label htmlFor="dedicated-agent-radio" className="text-lg font-bold text-gray-900 dark:text-white">
										Dedicated Agent
									</label>
									<p className="dark:text-white ml-7 text-sm text-gray-600 my-2">
										Private agent instance exclusively for your <br></br> organization
									</p>
									<ul className="ml-7 space-y-1">
										<li className="text-sm text-gray-600 dark:text-white">• Higher performance and reliability</li>
										<li className="text-sm text-gray-600 dark:text-white">• Enhanced privacy and security</li>
										<li className="text-sm text-gray-600 dark:text-white">• Full control over the agent infrastructure</li>
									</ul>
								</div>
	
								{/* Shared Agent Card */}
								<div 
									className={`border rounded-lg p-5 cursor-pointer ${
										agentType === AgentType.SHARED 
											? 'border-yellow-500' 
											: 'border-gray-200 hover:border-gray-300'
									}`}
									onClick={() => onRadioSelect(AgentType.SHARED)}
								>
									<div className="flex items-start">
										<input
											id="shared-agent-radio"
											type="radio"
											value={AgentType.SHARED}
											checked={agentType === AgentType.SHARED}
											disabled={agentType === AgentType.DEDICATED}
											onChange={() => onRadioSelect(AgentType.SHARED)}
											name="agent-type"
											className="w-4 h-4 mt-1 text-yellow-500 disabled:opacity-50"
										/>
										<div className="ml-3 flex justify-end w-full">
									
											<div className="bg-purple-100 rounded-full p-2">
												<svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
													<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
												</svg>
											</div>
										</div>
									</div>
									<label htmlFor="shared-agent-radio" className="text-lg font-bold text-gray-900 dark:text-white">
										Shared Agent
									</label>
									<p className="dark:text-white ml-7 text-sm text-gray-600 my-2">
										Use our cloud-hosted shared agent infrastructure
									</p>
									<ul className="ml-7 space-y-1">
										<li className="text-sm text-gray-600 dark:text-white">• Cost-effective solution</li>
										<li className="text-sm text-gray-600 dark:text-white">• Managed infrastructure</li>
										<li className="text-sm text-gray-600 dark:text-white">• Quick setup with no maintenance</li>
									</ul>
								</div>
							</div>
						</div>
					)}
	

                {formComponent}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

  );
};

export default WalletSpinup;