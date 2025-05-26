'use client'

import { JSX, useEffect, useState } from 'react'
import { apiStatusCodes, emailCredDefHeaders } from '@/config/CommonConstant'
import {
  resetCredDefId,
  setCredDefData,
  setSchemaCredDefs,
} from '@/lib/verificationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import BackButton from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import { CredDefData } from '../type/interface'
import CustomCheckbox from '@/components/CustomCheckbox'
import DataTable from '@/components/DataTable'
import { ITableData } from './SortDataTable'
import { getCredentialDefinitionsForVerification } from '@/app/api/verification'
import { getSchemaById } from '@/app/api/schema'
import { pathRoutes } from '@/config/pathRoutes'
import { useRouter } from 'next/navigation'

const EmailCredDefSelection = (): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [credDefList, setCredDefList] = useState<ITableData[]>([])
  const [selectedCredDefs, setSelectedCredDefs] = useState<CredDefData[]>([])

  const dispatch = useAppDispatch()
  const router = useRouter()
  const schemaIds = useAppSelector((state) => state.verification.schemaId)
  const orgId = useAppSelector((state) => state.organization.orgId)
  const getRawCredDefs = useAppSelector(
    (state) => state.verification.SCHEMA_CRED_DEFS as CredDefData[],
  )

  const handleContinue = (): void => {
    router.push(pathRoutes.organizations.verification.attributes)
  }

  const selectConnection = async (
    credDefId: string,
    checked: boolean,
  ): Promise<void> => {
    if (!credDefId) {
      return
    }

    const selectedCredDef = getRawCredDefs.find(
      (credDef: CredDefData) => credDef.credentialDefinitionId === credDefId,
    )

    if (selectedCredDef) {
      setSelectedCredDefs((prevSelected) => {
        if (checked) {
          const isAlreadySelected = prevSelected.some(
            (credDef) =>
              credDef.credentialDefinitionId ===
              selectedCredDef.credentialDefinitionId,
          )

          if (!isAlreadySelected) {
            const newSelected = [...prevSelected, selectedCredDef]

            dispatch(setCredDefData(newSelected))
            return newSelected
          }
        } else {
          const newSelected = prevSelected.filter(
            (credDef) =>
              credDef.credentialDefinitionId !==
              selectedCredDef.credentialDefinitionId,
          )

          dispatch(setCredDefData(newSelected))
          return newSelected
        }

        return prevSelected
      })
    }
  }

  const getCredDefs = async (schemaIds: string[]): Promise<void> => {
    setLoading(true)
    let allCredDefs: ITableData[] = []
    const rawCredDefs: CredDefData[] = []

    for (const schemaId of schemaIds) {
      try {
        const response = await getCredentialDefinitionsForVerification(schemaId)

        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          const getSchemaDetails = await getSchemaById(schemaId, orgId)
          const schemaName =
            typeof getSchemaDetails !== 'string'
              ? getSchemaDetails?.data?.data?.schema?.name
              : undefined

          const credDefs = data?.data?.map((ele: CredDefData) => {
            rawCredDefs.push(ele)

            return {
              data: [
                {
                  data: (
                    <div className="flex items-center space-x-4">
                      <CustomCheckbox
                        showCheckbox={true}
                        isVerificationUsingEmail={true}
                        onChange={(checked: boolean) => {
                          selectConnection(ele?.credentialDefinitionId, checked)
                        }}
                        isSelectedSchema={false}
                      />
                      <span>{ele?.tag ? ele?.tag : 'Not available'}</span>
                    </div>
                  ),
                },
                { data: schemaName || 'Not available' },
                {
                  data:
                    ele?.revocable === true ? (
                      <span className="text-revocable-yes">Yes</span>
                    ) : (
                      <span className="text-revocable-no">No</span>
                    ),
                },
              ],
            }
          })

          allCredDefs = [...allCredDefs, ...credDefs]
        } else {
          console.error(
            `Error fetching credential definitions for schema ${schemaId}`,
          )
        }
      } catch (error) {
        console.error(
          `Error fetching credential definitions for schema ${schemaId}:`,
          error,
        )
      }
    }

    setLoading(false)
    setCredDefList(allCredDefs)
    dispatch(setSchemaCredDefs(rawCredDefs))

    if (allCredDefs.length === 0) {
      setError('No Credential Definitions Found')
    }
  }

  const getSchemaAndCredDef = async (): Promise<void> => {
    try {
      if (schemaIds && schemaIds.length > 0) {
        getCredDefs(schemaIds)
      }
    } catch (error) {
      console.error('Error fetching schema details:', error)
    }
  }
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      dispatch(resetCredDefId())
      getSchemaAndCredDef()
    }

    fetchData()
  }, [])

  return (
    <div className="px-4 pt-2">
      <div className="col-span-full mb-4 xl:mb-2">
        <div className="flex items-center justify-end">
          <BackButton path={pathRoutes.organizations.verification.email} />
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="ml-1 text-xl font-semibold sm:text-2xl">
            Credential-definition
          </h1>
        </div>
      </div>

      {error && (
        <AlertComponent
          message={error}
          type={'failure'}
          onAlertClose={() => {
            setError(null)
          }}
        />
      )}
      <DataTable
        header={emailCredDefHeaders}
        data={credDefList}
        loading={loading}
        isEmailVerification={true}
      />
      <div className="flex items-center justify-end">
        <Button
          onClick={handleContinue}
          disabled={selectedCredDefs.length === 0}
          className="flex items-center gap-2 rounded-lg px-4 py-4 text-base font-medium sm:w-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              fill="#000"
              d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z"
            />
            <path
              fill="#000"
              d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z"
            />
          </svg>
          Continue
        </Button>
      </div>
    </div>
  )
}

export default EmailCredDefSelection
