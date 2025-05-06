"use client";

import * as React from "react";
import { nanoid } from "nanoid";
import { ethers } from "ethers";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiStatusCodes, storageKeys } from "@/config/CommonConstant";
import { envConfig } from "@/config/envConfig";
import {  Network, DidMethod } from "@/common/enums";
import { createDid, createPolygonKeyValuePair, getOrganizationById } from "@/app/api/organization";
import { CommonConstants } from "../common/enum";

interface IPolygonKeys {
  privateKey: string;
  publicKeyBase58: string;
  address: string;
}

interface CreateDIDModalProps {
  openModal: boolean;
  orgId:string;
  setOpenModal: (open: boolean) => void;
  setMessage: (message: string) => void;
  onEditSucess?: () => void;
}

interface IFormValues {
  method: string | null;
  ledger: string | null;
  network: string | null;
  domain: string;
  privatekey: string;
  endorserDid: string;
  did?: string;
}

const CreateDIDModal = (props: CreateDIDModalProps) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errMsg, setErrMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [seed, setSeed] = React.useState("");
  const [generatedKeys, setGeneratedKeys] = React.useState<IPolygonKeys | null>(
    null
  );
  const [ledgerValue, setLedgerValue] = React.useState<string | null>(null);
  const [method, setMethod] = React.useState<string | null>(null);
  const [networkValue, setNetworkValue] = React.useState<string | null>(null);
  const [completeDidMethodValue, setCompleteDidMethodValue] = React.useState<
    string | null
  >(null);
  const [havePrivateKey, setHavePrivateKey] = React.useState(false);
  const [privateKeyValue, setPrivateKeyValue] = React.useState<string>("");
  const [walletErrorMessage, setWalletErrorMessage] = React.useState<
    string | null
  >(null);

  // Dynamically build schema based on method
  const getFormSchema = () => {
    const baseSchema = z.object({
      method: z.string(),
      ledger: z.string(),
      network: z.string().optional(),
      domain: z.string().optional(),
      privatekey: z.string().optional(),
      endorserDid: z.string().optional(),
      did: z.string().optional(),
    });

    // Enhance schema with conditional validation
    if (method === DidMethod.WEB) {
      return baseSchema.extend({
        domain: z.string().min(1, "Domain is required"),
      });
    } else if (method === DidMethod.POLYGON) {
      return baseSchema.extend({
        privatekey: z
          .string()
          .min(1, "Private key is required")
          .length(64, "Private key must be exactly 64 characters long"),
      });
    }

    return baseSchema;
  };

  const form = useForm<IFormValues>({
    resolver: zodResolver(getFormSchema()),
    defaultValues: {
      method: "",
      ledger: "",
      network: "",
      domain: "",
      privatekey: "",
      endorserDid: "",
      did: "",
    },
  });

  const fetchOrganizationDetails = async () => {
    const response = await getOrganizationById(props.orgId);
    const { data } = response;
    setLoading(false);
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const didMethod = data?.data?.org_agents[0]?.orgDid
        ?.split(":")
        .slice(0, 2)
        .join(":");
      setMethod(didMethod);

      let ledgerName;
      if (didMethod === DidMethod.INDY || DidMethod.POLYGON) {
        ledgerName = data?.data?.org_agents[0]?.orgDid.split(":")[1];
      } else {
        ledgerName = "No Ledger";
      }
      setLedgerValue(ledgerName);

      let networkName;
      if (didMethod === DidMethod.INDY) {
        networkName = data?.data?.org_agents[0]?.orgDid
          .split(":")
          .slice(2, 4)
          .join(":");
      } else if (didMethod === DidMethod.POLYGON) {
        networkName = data?.data?.org_agents[0]?.orgDid.split(":")[2];
      } else {
        networkName = "";
      }
      setNetworkValue(networkName);

      let completeDidMethod;
      if (didMethod === DidMethod.INDY) {
        completeDidMethod = data?.data?.org_agents[0]?.orgDid
          .split(":")
          .slice(0, 4)
          .join(":");
      } else {
        completeDidMethod = didMethod;
      }
      setCompleteDidMethodValue(completeDidMethod);

      // Update form values
      form.reset({
        method: didMethod,
        ledger: ledgerName,
        network: networkName,
        domain: "",
        privatekey: generatedKeys?.privateKey.slice(2) || "",
        endorserDid: "",
      });
    } else {
      console.error("Error in fetching organization:::");
    }
  };

  React.useEffect(() => {
    fetchOrganizationDetails();
  }, []);

  const checkBalance = async (privateKey: string, network: Network) => {
    try {
      const rpcUrls = {
        testnet: `${envConfig.PLATFORM_DATA.polygonTestnet}`,
        mainnet: `${envConfig.PLATFORM_DATA.polygonMainnet}`,
      };

      const networkUrl = rpcUrls?.[network];

      const provider = new ethers.JsonRpcProvider(networkUrl);

      const wallet = new ethers.Wallet(privateKey, provider);
      const address = await wallet.getAddress();
      const balance = await provider.getBalance(address);

      const etherBalance = ethers.formatEther(balance);

      if (parseFloat(etherBalance) < CommonConstants.BALANCELIMIT) {
        setWalletErrorMessage("You have insufficient funds.");
      } else {
        setWalletErrorMessage(null);
      }

      return etherBalance;
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      return null;
    }
  };

  React.useEffect(() => {
    if (privateKeyValue && privateKeyValue.length === 64) {
      checkBalance(privateKeyValue, Network.TESTNET);
    } else {
      setWalletErrorMessage(null);
    }
  }, [privateKeyValue]);

  const createNewDid = async (values: IFormValues) => {
    setLoading(true);

    let network = "";
    if (values.method === DidMethod.INDY) {
      network = values?.network || "";
    } else if (values.method === DidMethod.POLYGON) {
      network = `${values.ledger}:${values.network}`;
    }
    const didData = {
      seed: values.method === DidMethod.POLYGON ? "" : seed,
      keyType: "ed25519",
      method: values.method?.split(":")[1] || "",
      network: network,
      domain: values.method === DidMethod.WEB ? values.domain : "",
      role: values.method === DidMethod.INDY ? "endorser" : "",
      privatekey: values.method === DidMethod.POLYGON ? values.privatekey : "",
      did: values?.did ?? "",
      endorserDid: values?.endorserDid || "",
      isPrimaryDid: false,
    };
    try {
      const response = await createDid(props.orgId, didData);
      const { data } = response;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        if (props?.onEditSucess) {
          props?.onEditSucess();
        }
        props.setOpenModal(false);
        props.setMessage(data?.message);
        setSuccessMsg(data?.message);
        setLoading(true);
      } else {
        setErrMsg(response as string);
        setLoading(false);
        props.setOpenModal(true);
      }
    } catch (error) {
      console.error("An error occurred while creating did:", error);
      setLoading(false);
    }
  };

  const generatePolygonKeyValuePair = async () => {
    setIsLoading(true);
    try {
      const resCreatePolygonKeys = await createPolygonKeyValuePair(props.orgId);
      const { data } = resCreatePolygonKeys;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setGeneratedKeys(data?.data);
        setIsLoading(false);
        const privateKey = data?.data?.privateKey.slice(2);
        setPrivateKeyValue(privateKeyValue || privateKey);
        form.setValue("privatekey", privateKey);
        await checkBalance(privateKeyValue || privateKey, Network.TESTNET);
      }
    } catch (err) {
      console.error("Generate private key ERROR::::", err);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    setSeed(nanoid(32));
  }, []);

  React.useEffect(() => {
    if (havePrivateKey) {
      setPrivateKeyValue("");
      setWalletErrorMessage(null);
      setGeneratedKeys(null);
      form.setValue("privatekey", "");
    } else {
      setPrivateKeyValue("");
      setWalletErrorMessage(null);
      form.setValue("privatekey", "");
    }
  }, [havePrivateKey, form]);

  function CopyDid({ value, className }: { value: string; className?: string }) {
    const [copied, setCopied] = React.useState(false);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="truncate">{value}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8"
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  function TokenWarningMessage() {
    return (
      <div className="mt-3 text-xs">
        <p>Note: You need to have tokens in your wallet to create a DID.</p>
      </div>
    );
  }

  function onSubmit(values: IFormValues) {
    createNewDid(values).then(() => {
      window.location.reload();
    });
  }

  return (
    <Dialog open={props.openModal} onOpenChange={props.setOpenModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create DID</DialogTitle>
        </DialogHeader>

        {(successMsg || errMsg) && (
          <Alert variant={successMsg ? "default" : "destructive"}>
            <AlertDescription>
              {successMsg || errMsg}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ledger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ledger <span className="text-destructive text-xs">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className=""
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {method !== DidMethod.KEY && (
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Method <span className="text-destructive text-xs">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className=""
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {method !== DidMethod.WEB && method !== DidMethod.KEY && (
                <FormField
                  control={form.control}
                  name="network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Network <span className="text-destructive text-xs">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className=""
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {method === DidMethod.WEB && (
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Domain <span className="text-destructive text-xs">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter Name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormItem>
                <FormLabel>
                  DID Method <span className="text-destructive text-xs">*</span>
                </FormLabel>
                <Input
                  value={completeDidMethodValue || ""}
                  readOnly
                  className=""
                />
              </FormItem>

              {method === DidMethod.POLYGON && (
                <>
                  <div className="col-span-1 sm:col-span-2">
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="havePrivateKey"
                        checked={havePrivateKey}
                        onCheckedChange={(checked) => 
                          setHavePrivateKey(checked === true)
                        }
                      />
                      <Label htmlFor="havePrivateKey">
                        Already have a private key?
                      </Label>
                    </div>

                    {!havePrivateKey ? (
                      <>
                        <div className="flex justify-between items-center my-3">
                          <Label>
                            Generate private key{" "}
                            <span className="text-destructive text-xs">*</span>
                          </Label>
                          <Button
                            type="button"
                            onClick={generatePolygonKeyValuePair}
                            disabled={isLoading}
                          >
                            {isLoading ? "Generating..." : "Generate"}
                          </Button>
                        </div>

                        {generatedKeys && (
                          <>
                            <div className="mt-3 relative">
                              <FormField
                                control={form.control}
                                name="privatekey"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <div className="flex items-center">
                                        <Input
                                          {...field}
                                          className="truncate"
                                          readOnly
                                          value={generatedKeys.privateKey.slice(2)}
                                        />
                                        <div className="ml-2">
                                          <CopyDid
                                            value={generatedKeys.privateKey.slice(2)}
                                          />
                                        </div>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                    {walletErrorMessage && (
                                      <p className="text-sm text-destructive">
                                        {walletErrorMessage}
                                      </p>
                                    )}
                                  </FormItem>
                                )}
                              />
                            </div>

                            <TokenWarningMessage />

                            <div className="my-3">
                              <p className="text-sm">
                                <span className="font-semibold">Address:</span>
                                <CopyDid value={generatedKeys.address} className="mt-1" />
                              </p>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <FormField
                        control={form.control}
                        name="privatekey"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter private key"
                                onChange={(e) => {
                                  field.onChange(e);
                                  setPrivateKeyValue(e.target.value);
                                  setWalletErrorMessage(null);
                                  if (e.target.value.length === 64) {
                                    checkBalance(e.target.value, Network.TESTNET);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            {walletErrorMessage && (
                              <p className="text-sm text-destructive">
                                {walletErrorMessage}
                              </p>
                            )}
                            <TokenWarningMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="col-span-1 sm:col-span-2">
                    <h3 className="text-sm font-semibold mb-2">
                      Follow these instructions to generate polygon tokens:
                    </h3>
                    <ol className="space-y-2 text-sm">
                      <li>
                        <span className="font-semibold">Step 1:</span>
                        <div className="ml-4">
                          Copy the address and get the free tokens for the testnet.
                          <div>
                            For eg. use{" "}
                            <a
                              href="https://faucet.polygon.technology/"
                              className="underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              https://faucet.polygon.technology/
                            </a>{" "}
                            to get free token
                          </div>
                        </div>
                      </li>
                      <li>
                        <span className="font-semibold">Step 2:</span>
                        <div className="ml-4">
                          Check that you have received the tokens.
                          <div>
                            For eg. copy the address and check the balance on{" "}
                            <a
                              href="https://mumbai.polygonscan.com/"
                              className="underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              https://mumbai.polygonscan.com/
                            </a>
                          </div>
                        </div>
                      </li>
                    </ol>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  loading ||
                  (method === DidMethod.POLYGON && !form.getValues("privatekey"))
                }
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Icons
function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default CreateDIDModal;