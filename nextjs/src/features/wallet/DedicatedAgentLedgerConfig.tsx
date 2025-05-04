"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { useState, useEffect } from "react";
import * as yup from 'yup';
import type { AxiosResponse } from 'axios';
import React from "react";
import { getLedgerConfig, getLedgers } from "@/app/api/organization";
import { apiStatusCodes } from "@/config/CommonConstant";
import CopyDid from "./CopyDid";
import { DidMethod, Environment, Ledgers, Network } from "../common/enum";
import { IDedicatedAgentForm } from "./DedicatedAgentForm";
import { envConfig } from "@/config/envConfig";
import Stepper from "../common/stepperComponent";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Database, Zap, Key } from "lucide-react";
import Link from "next/link";

// Import SetDomainValueInput and SetPrivateKeyValueInput components
// You'll need to create these components separately using Shadcn UI
import SetDomainValueInput from './SetDomainValueInput';
import SetPrivateKeyValueInput from './SetPrivateKeyValue';
import { useRouter } from "next/navigation";

interface IDetails {
  [key: string]: string | { [subKey: string]: string };
}

interface ILedgerItem {
  name: string;
  details: IDetails;
}

interface ILedgerConfigData {
  indy: {
    'did:indy': {
      [key: string]: string;
    };
  };
  polygon: {
    'did:polygon': {
      [key: string]: string;
    };
  };
  noLedger: {
    [key: string]: string;
  };
}

interface IValuesShared {
  seed: string;
  keyType: string;
  method: string;
  network: string;
  role: string;
  ledger: string;
  privatekey: string;
  [key: string]: string;
}

const RequiredAsterisk = () => <span className="text-xs text-destructive">*</span>

const DedicatedLedgerConfig = ({
  loading,
  seeds,
  maskedSeeds,
  submitDedicatedWallet,
}: IDedicatedAgentForm) => {
  const [haveDidShared, setHaveDidShared] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(''); 
  const [selectedNetwork, setSelectedNetwork] = useState(''); 
  const [seedVal, setSeedVal] = useState('');
  const [maskedSeedVal, setMaskedSeedVal] = useState('');
  const [selectedDid, setSelectedDid] = useState('');
  const [mappedData, setMappedData] = useState<ILedgerConfigData | null>(null);
  const [domainValue, setDomainValue] = useState<string>('');
  const [privateKeyValue, setPrivateKeyValue] = useState<string>('');
  const [networks, setNetworks] = useState([]);
  const [formikInstance, setFormikInstance] = useState(null);
const router = useRouter();
  const fetchLedgerConfig = async () => {
    try {
      const { data } = await getLedgerConfig() as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const ledgerConfigData: ILedgerConfigData = {
          indy: {
            [`${DidMethod.INDY}`]: {}
          },
          polygon: {
            [`${DidMethod.POLYGON}`]: {}
          },
          noLedger: {}
        };
        
        data.data.forEach(({ name, details }: ILedgerItem) => {
          const lowerName = name.toLowerCase();
        
          if (lowerName === Ledgers.INDY && details) {
            for (const [key, subDetails] of Object.entries(details)) {
              if (typeof subDetails === 'object' && subDetails !== null) {
                for (const [subKey, value] of Object.entries(subDetails)) {
                  const formattedKey = `${key}:${subKey}`.replace(`${DidMethod.INDY}:`, '');
                  ledgerConfigData.indy[`${DidMethod.INDY}`][formattedKey] = value;
                }
              }
            }
          } else if (lowerName === Ledgers.POLYGON && details) {
            for (const [key, value] of Object.entries(details)) {
              if (typeof value === 'object' && value !== null) {
                for (const [subKey, subValue] of Object.entries(value)) {
                  ledgerConfigData.polygon[`${DidMethod.POLYGON}`][subKey] = subValue;
                }
              } else if (typeof value === 'string') {
                ledgerConfigData.polygon[`${DidMethod.POLYGON}`][key] = value;
              }
            }
          } else if (lowerName === Ledgers.NO_LEDGER.toLowerCase() && details) {
            for (const [key, value] of Object.entries(details)) {
              ledgerConfigData.noLedger[key] = value as string;
            }
          }
        });
        
        setMappedData(ledgerConfigData);
      }
    } catch (err) {
      console.error('Fetch Network ERROR::::', err);
    }
  };
  
  const fetchNetworks = async () => {
    try {
      const { data } = (await getLedgers()) as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        setNetworks(data?.data || []);
        return data?.data;
      }
      return [];
    } catch (err) {
      console.error('Fetch Network ERROR::::', err);
    }
  };

  const handleLedgerSelect = (ledger: string) => {
    setSelectedLedger(ledger);
    setSelectedMethod('');
    setSelectedNetwork('');
    setSelectedDid('');
  };

  const handleMethodChange = (method: React.SetStateAction<string>) => {
    console.log("🚀 ~ handleMethodChange ~ method:vv>>>>==================", method)
    setSelectedMethod(method);
    setSelectedDid('');
  };

  const handleNetworkChange = (network: React.SetStateAction<string>, didMethod: React.SetStateAction<string>) => {
    console.log("🚀 ~ handlenetworkChange ~ network:vv>>>>==================", network)

    setSelectedNetwork(network);
    setSelectedDid(didMethod);
  };

  useEffect(() => {
    fetchNetworks();
    fetchLedgerConfig();
  }, []);

  useEffect(() => {
    setSeedVal(seeds);
    setMaskedSeedVal(maskedSeeds);
  }, [seeds]);

  const validations = {
    ledger: yup.string().required('Ledger is required'),
    method: yup.string().required('Method is required'),
    ...(haveDidShared) && {
      seed: yup.string().required('Seed is required'),
      did: yup.string().required('DID is required'),
    },
    ...(DidMethod.INDY === selectedMethod || DidMethod.POLYGON === selectedMethod) && { network: yup.string().required('Network is required') },
    ...(DidMethod.WEB === selectedMethod) && { domain: yup.string().required('Domain is required') },
  };

  const renderNetworkOptions = (formikHandlers) => {
    if (!selectedLedger || !selectedMethod || !mappedData) {
      return null;
    }
  
    const networkOptions = mappedData[selectedLedger][selectedMethod];
  
    if (!networkOptions) {
      return null;
    }
  
    let filteredNetworks = Object.keys(networkOptions);
    if (envConfig.MODE === Environment.PROD && selectedMethod === DidMethod.POLYGON) {
      filteredNetworks = filteredNetworks.filter(network => network === Network.MAINNET);
    } else if ((envConfig.MODE === Environment.DEV || envConfig.MODE === Environment.QA) && selectedMethod === DidMethod.POLYGON) {
      filteredNetworks = filteredNetworks.filter(network => network === Network.TESTNET);
    }
    
    return (
      <div className="space-y-2">
        <Label htmlFor="network" className="text-sm font-medium">
          Network <RequiredAsterisk />
        </Label>
        <Select
          value={selectedNetwork || undefined}
          onValueChange={(value) => {
            formikHandlers.setFieldValue('network', value);
            // Find the didMethod for the selected network
            const didMethod = Object.entries(networkOptions).find(
              ([network, did]) => did === value
            )?.[0];
            handleNetworkChange(value, networkOptions[didMethod] || '');
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Network" />
          </SelectTrigger>
          <SelectContent>
            {filteredNetworks.map((network) => (
              <SelectItem key={network} value={networkOptions[network]}>
                {network}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formikHandlers.errors.network && formikHandlers.touched.network && (
          <div className="text-destructive text-xs mt-1">{formikHandlers.errors.network}</div>
        )}
      </div>
    );
  };

  const renderMethodOptions = (formikHandlers) => {
    if (!selectedLedger || !mappedData) {
      return null;
    }
  
    const methods = mappedData[selectedLedger];
  
    if (!methods) {
      return null;
    }
  
    return (
      <div className="space-y-2">
        <Label htmlFor="method" className="text-sm font-medium">
          Method <RequiredAsterisk />
        </Label>
        <Select
          value={formikHandlers.values.method || undefined}
          onValueChange={(value) => {
            formikHandlers.setFieldValue('method', value);
            handleMethodChange(value);
            setDomainValue('');
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Method" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(methods).map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {formikHandlers.errors.method && formikHandlers.touched.method && (
          <div className="text-destructive text-xs mt-1">{formikHandlers.errors.method}</div>
        )}
      </div>
    );
  };

  const isSubmitDisabled = () => {
    if (!selectedLedger) {
      return true;
    }
    else if ((selectedLedger === Ledgers.POLYGON && !privateKeyValue) || (selectedLedger === Ledgers.INDY && (!selectedMethod || !selectedNetwork))) {
      return true;
    }
    else if ((selectedLedger === Ledgers.NO_LEDGER && !selectedMethod) ||(selectedLedger === Ledgers.NO_LEDGER && selectedMethod === DidMethod.WEB && !domainValue)) {
      return true;
    }

    return false;
  };

  const LedgerCard = ({ ledger, title, description, icon }: { ledger: string, title: string, description: string, icon: React.ReactNode }) => {
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${selectedLedger === ledger ? 'border-yellow-500 shadow-lg' : 'border-border'}`}
        onClick={() => handleLedgerSelect(ledger)}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            ledger === Ledgers.INDY ? 'bg-blue-100' : 
            ledger === Ledgers.POLYGON ? 'bg-purple-100' : 'bg-gray-100'
          }`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground text-center">{description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-background p-6 rounded-lg shadow-sm">
      {/* Header with back button */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="icon" className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-medium">Ledger Configuration</h2>
          <p className="text-sm text-muted-foreground">Choose your ledger and DID method</p>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          Step 3 of 4
        </div>
      </div>

      {/* Progress bar */}
      <Stepper currentStep={3} totalSteps={4} />
      
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6 mt-6">
          <RadioGroup
            defaultValue={haveDidShared ? "have" : "create"}
            onValueChange={(value) => setHaveDidShared(value === "have")}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="create" id="createNewDid" />
              <Label htmlFor="createNewDid">Create a new DID</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="have" id="haveDidShared" />
              <Label htmlFor="haveDidShared">I already have a DID</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Generated Seed Field */}
        {!haveDidShared && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <Label className="block text-sm font-medium mb-2">Generated Seed</Label>
              <div className="flex items-center">
                <div className="flex-1 p-3 bg-background border rounded-lg break-all">
                  {maskedSeedVal}
                </div>
                <CopyDid
                  className="ml-2 text-primary"
                  onCopy={() => navigator.clipboard.writeText(seedVal)}
                />
              </div>
              <Alert variant="warning" className="mt-2">
                <AlertDescription className="text-sm flex items-center">
                  Save this seed securely. It will be required to recover your wallet.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Already have DID fields */}
        {haveDidShared && (
          <div className="mb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seed" className="text-sm font-medium">
                Seed <RequiredAsterisk />
              </Label>
              <Input
                id="seed"
                name="seed"
                placeholder="Enter your seed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="did" className="text-sm font-medium">
                DID <RequiredAsterisk />
              </Label>
              <Input
                id="did"
                name="did"
                placeholder="Enter your DID"
              />
            </div>
          </div>
        )}
      </div>

      {/* Selection section */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Select Ledger</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LedgerCard 
            ledger={Ledgers.INDY}
            title="Indy"
            description="Hyperledger Indy"
            icon={<Database className="h-8 w-8 text-blue-600" />}
          />
          <LedgerCard 
            ledger={Ledgers.POLYGON}
            title="Polygon"
            description="Polygon blockchain"
            icon={<Zap className="h-8 w-8 text-purple-600" />}
          />
          <LedgerCard 
            ledger={Ledgers.NO_LEDGER}
            title="No Ledger"
            description="Local key generation"
            icon={<Key className="h-8 w-8 text-gray-600" />}
          />
        </div>
      </div>

      {/* Digital Identity section */}
      <Formik
        initialValues={{
          seed: seedVal || '',
          keyType: '',
          method: selectedMethod || '',
          network: selectedNetwork || '',
          role: '',
          ledger: selectedLedger,
          privatekey: ''
        }}
        enableReinitialize={true}
        validationSchema={yup.object().shape(validations)}
        onSubmit={async (values: IValuesShared, actions: FormikHelpers<IValuesShared>) => {
          values.ledger = selectedLedger;
          values.method = selectedMethod;
          values.network = selectedNetwork;
          if (!values.privatekey) {
            values.privatekey = privateKeyValue;
          }
          submitDedicatedWallet(
            values,
            privateKeyValue,
            domainValue
          );
          actions.resetForm();
        }}
      >
        {(formikHandlers): JSX.Element => (
          <Form>
            {/* Form fields based on selected ledger */}
            {selectedLedger && (
              <Card className="p-6 bg-background">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderMethodOptions(formikHandlers)}
                    
                    {(selectedMethod === DidMethod.INDY || selectedMethod === DidMethod.POLYGON) && (
                      renderNetworkOptions(formikHandlers)
                    )}
                  </div>
                
                  {/* Generated DID Method field */}
                  {selectedDid && (
                    <div className="mt-6">
                      <Label className="block mb-2 text-sm font-medium">
                        Generated DID Method
                      </Label>
                      <div className="p-3 rounded-lg text-foreground">
                        {selectedDid}
                      </div>
                    </div>
                  )}
                  
                  {/* Domain value for WEB method */}
                  {selectedMethod === DidMethod.WEB && (
                    <div className="mt-6">
                      <SetDomainValueInput
                        setDomainValue={setDomainValue}
                        domainValue={domainValue}
                        formikHandlers={formikHandlers}
                      />
                    </div>
                  )}
                  
                  {/* Private key for Polygon */}
                  {selectedMethod === DidMethod.POLYGON && (
                    <Card className="mt-6 bg-muted/50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <SetPrivateKeyValueInput 
                              setPrivateKeyValue={setPrivateKeyValue}
                              privateKeyValue={privateKeyValue} 
                              formikHandlers={formikHandlers} 
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-3">Follow these instructions to generate polygon tokens:</h4>
                            <ol className="space-y-3 text-sm">
                              <li className='flex items-start'>
                                <span className="font-semibold mr-2">Step 1:</span>
                                <div>
                                  Copy the address and get the free tokens for the testnet.
                                  <div className="mt-1">
                                    For eg. use <a href='https://faucet.polygon.technology/' className='text-primary underline'>https://faucet.polygon.technology/</a> to get free tokens
                                  </div>
                                </div>
                              </li>
                              <li className='flex items-start'>
                                <span className="font-semibold mr-2">Step 2:</span>
                                <div>
                                  Check that you have received the tokens.
                                  <div className="mt-1">
                                    For eg. copy the address and check the balance on <a href='https://mumbai.polygonscan.com/' className='text-primary underline'>https://mumbai.polygonscan.com/</a>
                                  </div>
                                </div>
                              </li>
                            </ol>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Action buttons */}
            <div className="flex justify-between mt-8">
              <Link href="/organizations" legacyBehavior>
              <Button
                   
                   onClick={() => router.push('/organizations/create-organization')}
                 >
                   Back
                 </Button>
              </Link>
              <Button
                onClick={() => {
                  formikHandlers.handleSubmit();
                }}
                disabled={isSubmitDisabled()}
                type="submit"
                variant="default"
                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Identity
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DedicatedLedgerConfig;