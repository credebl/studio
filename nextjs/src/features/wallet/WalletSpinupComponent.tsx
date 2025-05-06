'use client';

import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { nanoid } from 'nanoid';
import React from 'react';
import { createDid, createOrganization, getOrganizationById, setAgentConfigDetails, spinupSharedAgent } from '@/app/api/organization';
import { apiStatusCodes } from '@/config/CommonConstant';
import { DidMethod } from '../common/enum';
import SOCKET from '@/config/SocketConfig';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, User, Users } from "lucide-react";
import WalletStepsComponent from './WalletSteps';
import SharedAgentForm from './SharedAgentForm';
import Stepper from '@/components/StepperComponent';
import { useRouter } from 'next/navigation';
import DedicatedAgentForm from './DedicatedAgentForm';

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
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);
  const [orgIdOfCurrentOrg, setOrgIdOfCurrentOrg] = useState<string | null>(null);
  const router = useRouter();
  const alreadyCreatedOrgId = props.orgId

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

  const createOrganizationOnce = async () => {
  
    // If we have an existing org ID from props, fetch its details
    if (alreadyCreatedOrgId) {
      setCreatedOrgId(alreadyCreatedOrgId);
      
      try {
        const response = await getOrganizationById(alreadyCreatedOrgId as string);
        const { data } = response as AxiosResponse;
        
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
  
    if (!props.formData || !alreadyCreatedOrgId) {
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
    // const orgId = props.orgId;
    // const orgInfoData = await getFromLocalStorage(storageKeys.ORG_INFO);
    const response = await getOrganizationById(props.orgId as string);
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
      if (!createdOrgId && !props.orgId && orgIdOfCurrentOrg) {
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
    const orgId = await createOrganizationOnce();
    if (!orgId) return; // Stop if organization creation failed

    const agentPayload = {
      walletName: agentConfig.walletName,
      apiKey: agentConfig.apiKey,
      agentEndpoint: agentConfig.agentEndpoint,
    };
    
    try {
      const spinupRes = await setAgentConfigDetails(agentPayload, orgId);
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
        
    const spinupRes = await createDid(orgId as string, didData);
    const { data } = spinupRes as AxiosResponse;
    
    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setAgentSpinupCall(true);
      setSuccess(spinupRes as string);
      setWalletSpinStep(1); 

      setTimeout(() => {
        window.location.href = redirectUrl ? redirectUrl : '/organizations';  
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

    // Use the unified organization creation function
    const orgId = await createOrganizationOnce();
    setCreatedOrgId(orgId)
    if (!orgId) return; 
    
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
    
    try {
      const spinupRes = await spinupSharedAgent(payload, orgId);
      
      const { data } = spinupRes as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        
        if (data?.data['agentSpinupStatus'] === 1) {
          setAgentSpinupCall(true);
          setIsShared(true);
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

  useEffect(() => {
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
          orgId={orgIdOfCurrentOrg ? orgIdOfCurrentOrg : ''}
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
          <WalletStepsComponent steps={walletSpinStep} />
        </>
      );
    } else {
      formComponent = (
        <>
          <Stepper currentStep={4} totalSteps={4} />
          <WalletStepsComponent steps={walletSpinStep} />
        </>
      );
    }
  }

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
							<h3 className="text-lg font-medium mb-2">Agent Type</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Dedicated Agent Card */}
								<div 
									className={` rounded-lg p-5 cursor-pointer ${
										agentType === AgentType.DEDICATED 
											? 'ring' 
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
											className="w-4 h-4 mt-1"
										/>
										<div className="ml-3 flex justify-end w-full">
											
											<div className="bg-yellow-100 rounded-full p-2">
												<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
													<path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
												</svg>
											</div>
										</div>
									</div>
									<label htmlFor="dedicated-agent-radio" className="text-lg font-bold">
										Dedicated Agent
									</label>
									<p className="dark:text-white ml-7 text-sm my-2">
										Private agent instance exclusively for your <br></br> organization
									</p>
									<ul className="ml-7 space-y-1">
										<li className="text-sm ">• Higher performance and reliability</li>
										<li className="text-sm ">• Enhanced privacy and security</li>
										<li className="text-sm ">• Full control over the agent infrastructure</li>
									</ul>
								</div>
	
								{/* Shared Agent Card */}
								<div 
									className={`rounded-lg p-5 cursor-pointer ${
										agentType === AgentType.SHARED 
											? 'ring' 
											: ''
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
											className="w-4 h-4 mt-1"
										/>
										<div className="ml-3 flex justify-end w-full">
									
											<div className="bg-purple-100 rounded-full p-2">
												<svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
													<path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
												</svg>
											</div>
										</div>
									</div>
									<label htmlFor="shared-agent-radio" className="text-lg font-bold">
										Shared Agent
									</label>
									<p className="ml-7 text-sm  my-2">
										Use our cloud-hosted shared agent infrastructure
									</p>
									<ul className="ml-7 space-y-1">
										<li className="text-sm ">• Cost-effective solution</li>
										<li className="text-sm ">• Managed infrastructure</li>
										<li className="text-sm ">• Quick setup with no maintenance</li>
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