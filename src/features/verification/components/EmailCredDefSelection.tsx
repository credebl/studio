'use client'

import { JSX, useEffect, useRef, useState } from 'react'
import { apiStatusCodes, emailCredDefHeaders } from '@/config/CommonConstant'
import {
  resetCredDefId,
  setCredDefData,
  setSchemaCredDefs,
} from '@/lib/verificationSlice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { ArrowRight } from 'lucide-react'
import { AxiosResponse } from 'axios'
import BackButton from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import { CredDefData } from '../type/interface'
import CustomCheckbox from '@/components/CustomCheckbox'
import DataTable from '@/components/DataTable'
import { ITableData } from './SortDataTable'
import PageContainer from '@/components/layout/page-container'
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
  const getRawCredDefsRef = useRef<CredDefData[]>(getRawCredDefs)

  const handleContinue = (): void => {
    router.push(pathRoutes.organizations.verification.attributes)
  }

  useEffect(() => {
    getRawCredDefsRef.current = getRawCredDefs
  }, [getRawCredDefs])

  const selectConnection = async (
    credDefId: string,
    checked: boolean,
  ): Promise<void> => {
    if (!credDefId) {
      return
    }

    const latestCredDefs = getRawCredDefsRef.current

    const selectedCredDef = latestCredDefs?.find(
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
    if (!orgId) {
      setError('Organization ID is missing.')
      return
    }

    setLoading(true)
    let allCredDefs: ITableData[] = []
    let rawCredDefs: CredDefData[] = []

    for (const schemaId of schemaIds) {
      try {
        const response = await getCredentialDefinitionsForVerification(schemaId)
        const { data } = response as AxiosResponse

        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          const schemaDetails = await getSchemaById(schemaId, orgId)
          const schemaName =
            typeof schemaDetails !== 'string'
              ? schemaDetails?.data?.data?.schema?.name
              : undefined

          const currentCredDefs: CredDefData[] = data?.data ?? []

          rawCredDefs = [...rawCredDefs, ...currentCredDefs]

          const tableData: ITableData[] = currentCredDefs.map((ele) => ({
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
                    <span>{ele?.tag || 'Not available'}</span>
                  </div>
                ),
              },
              { data: schemaName || 'Not available' },
              {
                data: ele?.revocable ? (
                  <span className="text-revocable-yes">Yes</span>
                ) : (
                  <span className="text-revocable-no">No</span>
                ),
              },
            ],
            clickId: ele?.credentialDefinitionId || '',
          }))

          allCredDefs = [...allCredDefs, ...tableData]
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
        await getCredDefs(schemaIds)
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
    <PageContainer>
      <div className="px-4 pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex items-center justify-end">
            <BackButton path={pathRoutes.organizations.verification.email} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="mb-2 ml-1 text-xl font-semibold sm:text-2xl">
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
        <div className="mt-4 flex items-center justify-end">
          <Button
            onClick={handleContinue}
            disabled={selectedCredDefs.length === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-4 text-base font-medium sm:w-auto"
          >
            <ArrowRight />
            Continue
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default EmailCredDefSelection
