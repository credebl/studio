'use client'

import { CommonConstants, Network } from '../common/enum'
import React, { ChangeEvent, useEffect, useState } from 'react'

import type { AxiosResponse } from 'axios'
import { Checkbox } from '@/components/ui/checkbox'
import CopyDid from './CopyDid'
import GenerateBtnPolygon from './GenerateBtnPolygon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TokenWarningMessage from './TokenWarningMessage'
import { apiStatusCodes } from '@/config/CommonConstant'
import { createPolygonKeyValuePair } from '@/app/api/Agent'
import { ethers } from 'ethers'

export interface IPolygonKeys {
  privateKey: string
  publicKeyBase58: string
  address: string
}

interface IProps {
  orgId?: string
  privateKeyValue: string
  setPrivateKeyValue: (val: string) => void
}

const SetPrivateKeyValueInput = ({
  orgId,
  privateKeyValue,
  setPrivateKeyValue,
}: IProps): React.JSX.Element => {
  const [havePrivateKey, setHavePrivateKey] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<IPolygonKeys | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const checkWalletBalance = async (
    privateKey: string,
    network: Network,
  ): Promise<string | null> => {
    try {
      const rpcUrls = {
        testnet: process.env.NEXT_PUBLIC_POLYGON_TESTNET_URL,
        mainnet: process.env.NEXT_PUBLIC_POLYGON_MAINNET_URL,
      }

      const provider = new ethers.JsonRpcProvider(rpcUrls[network])
      const wallet = new ethers.Wallet(privateKey, provider)
      const balance = await provider.getBalance(await wallet.getAddress())
      const etherBalance = ethers.formatEther(balance)

      setErrorMessage(
        parseFloat(etherBalance) < CommonConstants.BALANCELIMIT
          ? 'You have insufficient funds.'
          : null,
      )

      return etherBalance
    } catch (error) {
      console.error('Error checking wallet balance:', error)
      return null
    }
  }
  useEffect(() => {
    if (privateKeyValue?.length === 64) {
      checkWalletBalance(privateKeyValue, Network.TESTNET)
    } else {
      setErrorMessage(null)
    }
  }, [privateKeyValue])

  useEffect(() => {
    setPrivateKeyValue('')
    setErrorMessage(null)
    if (havePrivateKey) {
      setGeneratedKeys(null)
    }
  }, [havePrivateKey])

  const generatePolygonKeyValuePair = async (): Promise<void> => {
    setLoading(true)
    try {
      const resCreatePolygonKeys = await createPolygonKeyValuePair(
        orgId as string,
      )
      const { data } = resCreatePolygonKeys as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
        setGeneratedKeys(data?.data)
        setLoading(false)
        const privateKey = data?.data?.privateKey.slice(2)
        setPrivateKeyValue(privateKey || privateKeyValue)
        await checkWalletBalance(privateKey || privateKeyValue, Network.TESTNET)
      }
    } catch (err) {
      console.error('Generate private key ERROR::::', err)
      setLoading(false)
    }
  }

  return (
    <div className="relative mb-3">
      <div className="mt-4 flex items-center gap-2">
        <Checkbox
          id="havePrivateKey"
          className="border"
          onCheckedChange={(checked) => setHavePrivateKey(checked as boolean)}
        />
        <Label htmlFor="havePrivateKey">Already have a private key?</Label>
      </div>

      {!havePrivateKey ? (
        <>
          <GenerateBtnPolygon
            generatePolygonKeyValuePair={generatePolygonKeyValuePair}
            loading={loading}
          />

          {generatedKeys && (
            <>
              <div className="relative mt-3 flex items-center">
                <CopyDid value={generatedKeys.privateKey.slice(2)} />
              </div>

              {errorMessage && (
                <span className="text-destructive static bottom-0 text-xs">
                  {errorMessage}
                </span>
              )}

              <TokenWarningMessage />

              <div className="relative my-3">
                <span className="truncate text-sm">
                  <span className="font-semibold">Address:</span>
                  <div className="flex">
                    <CopyDid value={generatedKeys.address} />
                  </div>
                </span>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="relative mt-3 flex items-center">
            <Input
              id="privateKeyValue"
              name="privateKeyValue"
              type="text"
              value={privateKeyValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPrivateKeyValue(e.target.value)
              }}
              placeholder="Enter private key"
            />
          </div>

          {errorMessage && (
            <span className="text-destructive static bottom-0 text-xs">
              {errorMessage}
            </span>
          )}

          <TokenWarningMessage />
        </>
      )}
    </div>
  )
}

export default SetPrivateKeyValueInput
