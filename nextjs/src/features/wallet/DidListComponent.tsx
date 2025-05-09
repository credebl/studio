import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy } from 'lucide-react';
import type { AxiosResponse } from 'axios';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  IDidListData,
  IUpdatePrimaryDid
} from '../organization/components/interfaces/organization';
import { updatePrimaryDid } from '@/app/api/Agent';
import { apiStatusCodes } from '@/config/CommonConstant';
import { Roles } from '@/common/enums';
import CreateDidComponent from './CreateDidComponent';
import { getDids } from '@/app/api/Agent';

const DIDList = ({ orgId }: { orgId: string }) => {
  const [didList, setDidList] = useState<IDidListData[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setPrimaryDid = async (id: string, did: string) => {
    try {
      const payload: IUpdatePrimaryDid = {
        id,
        did
      };
      const response = await updatePrimaryDid(orgId, payload);
      const { data } = response as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        window.location.reload();
      } else {
        setErrorMsg(response as string);
      }
    } catch (error) {
      console.error('Error setting primary DID:', error);
    }
  };

  const getData = async () => {
    try {
      const response = await getDids(orgId);
      const { data } = response as AxiosResponse;
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const sortedDids = data?.data.sort(
          (a: { isPrimaryDid: any }, b: { isPrimaryDid: any }) => {
            if (a.isPrimaryDid && !b.isPrimaryDid) return -1;
            if (!a.isPrimaryDid && b.isPrimaryDid) return 1;
            return 0;
          }
        );
        setDidList(sortedDids);
      }
    } catch (error) {
      console.error('Error fetching DIDs:', error);
    }
  };

  // const getUserOrgRoles = async () => {
  //   const orgRoles = await getFromLocalStorage(storageKeys.ORG_ROLES);
  //   const roles = orgRoles.split(',');
  //   setUserRoles(roles);
  // }

  useEffect(() => {
    getData();
    // getUserOrgRoles();
  }, []);

  const CopyDid = ({
    value,
    className
  }: {
    value: string;
    className?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`flex items-center gap-2 ${className}`}>
          <span className='truncate font-mono'>{value}</span>
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={() => navigator.clipboard.writeText(value)}
          >
            <Copy className='h-4 w-4' />
          </Button>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy to clipboard</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className='w-full space-y-4'>
      {successMsg && (
        <Alert variant='default' className='text-success'>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}
      {errorMsg && (
        <Alert variant='destructive'>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-bold'>DID Details</h3>
        <Button
          onClick={() => setShowPopup(true)}
          disabled={
            userRoles.includes(Roles.MEMBER) ||
            userRoles.includes(Roles.ISSUER) ||
            userRoles.includes(Roles.VERIFIER)
          }
          className=''
        >
          Create DID
        </Button>
      </div>

      <div className='divide-y rounded-lg border'>
        {didList.map((item: IDidListData, index: number) => (
          <div key={item.id} className={`p-4 ${item.isPrimaryDid ? '' : ''}`}>
            <div className='flex items-center justify-between gap-4'>
              <span className='w-16 shrink-0'>DID {index + 1}</span>
              <span>:</span>

              {item?.did ? (
                <CopyDid value={item.did} className='flex-1 font-mono' />
              ) : (
                <span className='flex-1 font-mono'>Not available</span>
              )}

              {item.isPrimaryDid ? (
                <Badge variant='default' className='ml-auto'>
                  Primary DID
                </Badge>
              ) : (
                <Button
                  onClick={() => setPrimaryDid(item.id, item.did)}
                  variant='outline'
                  className='ml-auto'
                >
                  Set Primary DID
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateDidComponent
        orgId={orgId}
        setOpenModal={(value) => setShowPopup(value)}
        loading={false}
        success={'message'}
        failure={''}
        openModal={showPopup}
        closeModal={() => setShowPopup(false)}
        onSuccess={() => console.log('On Success')}
        message={
          'Would you like to proceed? Keep in mind that this action cannot be undone.'
        }
        buttonTitles={['No, cancel', "Yes, I'm sure"]}
        isProcessing={false}
        setFailure={() => console.log('SET Error')}
        setSuccess={() => console.log('SET Success')}
      />
    </div>
  );
};

export default DIDList;
