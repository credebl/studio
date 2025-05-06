import { useEffect, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy } from 'lucide-react';
import CustomQRCode from '@/features/wallet/CustomQRCode';
import DIDList from '@/features/wallet/DidListComponent';
import { createConnection } from '@/app/api/organization';
import { Connection, OrgAgent, Organisation } from './interfaces/organization';
import { dateConversion } from '@/utils/DateConversion';
import { apiStatusCodes, storageKeys } from '@/config/CommonConstant';

const OrganizationDetails = ({ orgData }: { orgData: Organisation | null }) => {
  const orgId = orgData ? orgData?.id : '';
  const { org_agents } = orgData as Organisation;
  const agentData: OrgAgent | null = org_agents.length > 0 ? org_agents[0] : null;
  
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionData, setConnectionData] = useState<Connection | null>(null);

  const createQrConnection = async () => {
    setLoading(true);
    const response = await createConnection(orgId, orgData?.name as string);
    const { data } = response as AxiosResponse;

    if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
      setConnectionData(data?.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    createQrConnection();
  }, []);

  const CopyDid = ({ value, className, hideValue = false }: { value: string, className?: string, hideValue?: boolean }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 ${className}`}>
          {!hideValue && (
            <span className="truncate max-w-xs">{value}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => navigator.clipboard.writeText(value)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy to clipboard</p>
      </TooltipContent>
    </Tooltip>
  );

  const DateTooltip = ({ date, children }: { date: string, children: React.ReactNode }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{children}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{new Date(date).toLocaleString()}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Details</h2>
      
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Wallet Details */}
          <div className="flex-1">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="w-40 text-gray-500 dark:text-gray-400">Wallet Name</span>
                <span className="mx-2 text-gray-500 dark:text-gray-400">:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {agentData?.walletName}
                </span>
              </div>

              <div className="flex items-center">
                <span className="w-40 text-gray-500 dark:text-gray-400">Org DID</span>
                <span className="mx-2 text-gray-500 dark:text-gray-400">:</span>
                {agentData?.orgDid ? (
                  <CopyDid 
                    value={agentData?.orgDid}
                    className="font-mono font-semibold"
                  />
                ) : (
                  <span className="font-semibold text-gray-500 dark:text-gray-400">
                    Not available
                  </span>
                )}
              </div>

              <div className="flex items-center">
                <span className="w-40 text-gray-500 dark:text-gray-400">Network</span>
                <span className="mx-2 text-gray-500 dark:text-gray-400">:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {agentData?.ledgers?.name || '-'}
                </span>
              </div>

              <div className="flex items-center">
                <span className="w-40 text-gray-500 dark:text-gray-400">Agent Type</span>
                <span className="mx-2 text-gray-500 dark:text-gray-400">:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {agentData?.org_agent_type?.agent
                    ? agentData.org_agent_type.agent.charAt(0).toUpperCase() + 
                      agentData.org_agent_type.agent.slice(1).toLowerCase()
                    : ''}
                </span>
              </div>

              <div className="flex items-center">
                <span className="w-40 text-gray-500 dark:text-gray-400">Created On</span>
                <span className="mx-2 text-gray-500 dark:text-gray-400">:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {agentData?.createDateTime ? (
                    <DateTooltip date={agentData.createDateTime}>
                      {dateConversion(agentData.createDateTime)}
                    </DateTooltip>
                  ) : (
                    <DateTooltip date={new Date().toISOString()}>
                      {dateConversion(new Date().toISOString())}
                    </DateTooltip>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code - aligned inline with details */}
          <div className="lg:ml-8">
            {loading ? (
              <div className="flex justify-center items-center h-48 w-48">
                {/* Loading spinner can be added here */}
              </div>
            ) : (
              connectionData && (
                <div className="flex flex-col items-center">
                  <CustomQRCode
                    value={connectionData.connectionInvitation as string}
                    size={180}
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Scan to connect
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-6">
          <DIDList orgId={orgId}/>
        </div>
      </Card>

      {agentData?.orgDid?.startsWith('did:web') && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            DID Document
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Instructions:
              </h4>
              <ul className="space-y-1 text-gray-900 dark:text-white">
                <li>1. Kindly provide the DID document for hosting purposes in order to facilitate its publication</li>
                <li>2. Failure to host the DID document will result in the inability to publish your DID</li>
              </ul>
            </div>

            <div className="bg-gray-200 dark:bg-gray-700 rounded-md p-4">
              <div className="flex justify-between items-start">
                <pre className="overflow-x-auto">
                  <code className="text-sm">
                    {JSON.stringify(agentData?.didDocument, undefined, 4)}
                  </code>
                </pre>
                <CopyDid 
                  value={JSON.stringify(agentData?.didDocument)} 
                  hideValue={true}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default OrganizationDetails;