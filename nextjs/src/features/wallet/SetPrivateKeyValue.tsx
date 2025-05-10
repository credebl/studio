import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Field } from 'formik';
import { type ChangeEvent, useEffect, useState } from 'react';
import GenerateBtnPolygon from './GenerateBtnPolygon';
import { ethers } from 'ethers';
import type { AxiosResponse } from 'axios';
import TokenWarningMessage from './TokenWarningMessage';
import { createPolygonKeyValuePair } from '@/app/api/Agent';
import { apiStatusCodes } from '@/config/CommonConstant';
import CopyDid from './CopyDid';
import { envConfig } from '@/config/envConfig';
import { CommonConstants, Network } from '../common/enum';

export interface IPolygonKeys {
  privateKey: string;
  publicKeyBase58: string;
  address: string;
}

interface IProps {
  setPrivateKeyValue: (val: string) => void;
  orgId?: string;
  privateKeyValue: string | undefined;
  formikHandlers: {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    errors: {
      privatekey?: string;
    };
    touched: {
      privatekey?: boolean;
    };
  };
}

const SetPrivateKeyValueInput = ({
  setPrivateKeyValue,
  orgId,
  privateKeyValue,
  formikHandlers
}: IProps) => {
  const [havePrivateKey, setHavePrivateKey] = useState(false);
  const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkWalletBalance = async (privateKey: string, network: Network) => {
    try {
      const rpcUrls = {
        testnet: envConfig.PLATFORM_DATA.polygonTestnet,
        mainnet: envConfig.PLATFORM_DATA.polygonMainnet
      };

      const provider = new ethers.JsonRpcProvider(rpcUrls[network]);
      const wallet = new ethers.Wallet(privateKey, provider);
      const balance = await provider.getBalance(await wallet.getAddress());
      const etherBalance = ethers.formatEther(balance);

      setErrorMessage(
        parseFloat(etherBalance) < CommonConstants.BALANCELIMIT
          ? 'You have insufficient funds.'
          : null
      );

      return etherBalance;
    } catch (error) {
      console.error('Error checking wallet balance:', error);
      return null;
    }
  };

  useEffect(() => {
    if (privateKeyValue && privateKeyValue.length === 64) {
      checkWalletBalance(privateKeyValue, Network.TESTNET);
    } else {
      setErrorMessage(null);
    }
  }, [privateKeyValue]);

  useEffect(() => {
    if (havePrivateKey) {
      setPrivateKeyValue('');
      setErrorMessage(null);
      setGeneratedKeys(null);
    } else {
      setPrivateKeyValue('');
      setErrorMessage(null);
    }
  }, [havePrivateKey]);

  const generatePolygonKeyValuePair = async () => {
    setLoading(true);
    try {
      const resCreatePolygonKeys = await createPolygonKeyValuePair(
        orgId as string
      );
      const { data } = resCreatePolygonKeys as AxiosResponse;

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setGeneratedKeys(data?.data);
        setLoading(false);
        const privateKey = data?.data?.privateKey.slice(2);
        setPrivateKeyValue(privateKey || privateKeyValue);
        await checkWalletBalance(
          privateKey || privateKeyValue,
          Network.TESTNET
        );
      }
    } catch (err) {
      console.error('Generate private key ERROR::::', err);
    }
  };

  return (
    <div className='relative mb-3'>
      <div className='mt-4 flex items-center gap-2'>
        <Checkbox
          id='havePrivateKey'
          className='border'
          onCheckedChange={(checked) => setHavePrivateKey(checked as boolean)}
        />
        <Label htmlFor='havePrivateKey'>Already have a private key?</Label>
      </div>
      {!havePrivateKey ? (
        <>
          <GenerateBtnPolygon
            generatePolygonKeyValuePair={generatePolygonKeyValuePair}
            loading={loading}
          />

          {generatedKeys && (
            <>
              <div className='relative mt-3 flex items-center'>
                <Field
                  as={Input}
                  id='privatekey'
                  name='privatekey'
                  className='w-[480px] truncate'
                  value={generatedKeys.privateKey.slice(2)}
                  placeholder='Generated private key'
                  readOnly
                />
                <CopyDid value={generatedKeys.privateKey.slice(2)} />
              </div>

              {errorMessage && (
                <span className='text-destructive static bottom-0 text-xs'>
                  {errorMessage}
                </span>
              )}

              <TokenWarningMessage />

              <div className='relative my-3'>
                <p className='truncate text-sm'>
                  <span className='font-semibold'>Address:</span>
                  <div className='flex'>
                    <CopyDid value={generatedKeys.address} />
                  </div>
                </p>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className='relative mt-3 flex items-center'>
            <Field
              as={Input}
              id='privatekey'
              name='privatekey'
              className='w-[480px]'
              value={privateKeyValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPrivateKeyValue(e.target.value);
                formikHandlers.handleChange(e);
              }}
              onBlur={formikHandlers.handleBlur}
              placeholder='Enter private key'
            />
            <CopyDid value={privateKeyValue || ''} />
          </div>

          <span className='text-destructive static bottom-0 text-xs'>
            {formikHandlers.errors?.privatekey &&
              formikHandlers.touched?.privatekey &&
              formikHandlers.errors.privatekey}
          </span>

          {errorMessage && (
            <span className='text-destructive static bottom-0 text-xs'>
              {errorMessage}
            </span>
          )}

          <TokenWarningMessage />
        </>
      )}
    </div>
  );
};

export default SetPrivateKeyValueInput;
