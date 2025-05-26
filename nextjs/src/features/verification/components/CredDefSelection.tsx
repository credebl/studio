'use client'

import { JSX, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import BackButton from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/DataTable'
import { ITableData } from './SortDataTable'
import Loader from '@/components/Loader'
import SchemaCard from '@/features/schemas/components/SchemaCard'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getCredentialDefinitionsForVerification } from '@/app/api/verification'
import { pathRoutes } from '@/config/pathRoutes'
import { resetCredDefId } from '@/lib/verificationSlice'
import { setCredDefId } from '@/lib/storageKeys'
import { useRouter } from 'next/navigation'

interface CredentialDefinition {
  tag?: string
  credentialDefinitionId?: string
  revocable?: boolean
}

const CredDefSelection = (): JSX.Element => {
  const [schemaState, setSchemaState] = useState({
    schemaName: '',
    version: '',
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [credDefList, setCredDefList] = useState<ITableData[]>([])

  const dispatch = useAppDispatch()
  const router = useRouter()

  const schema = useAppSelector((state) => state.schema)
  const schemaId = useAppSelector((state) => state.verification.schemaId)

  const selectConnection = async (
    credDefId: string,
    checked: boolean,
  ): Promise<void> => {
    if (credDefId && checked) {
      dispatch(setCredDefId(credDefId))
    } else {
      dispatch(resetCredDefId())
    }
  }

  const getCredDefs = async (schemaId: string): Promise<void> => {
    setLoading(true)
    const response = await getCredentialDefinitionsForVerification(schemaId)

    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const credDefs = (data?.data as CredentialDefinition[])?.map((ele) => ({
        data: [
          { data: ele?.tag ?? 'Not available' },
          { data: ele?.credentialDefinitionId ?? 'Not available' },
          {
            data: ele?.revocable ? (
              <span className="text-blue-700 dark:text-white">Yes</span>
            ) : (
              <span className="text-cyan-500 dark:text-white">No</span>
            ),
          },
          {
            data: (
              <div className="flex items-center">
                <input
                  id="default-checkbox"
                  type="checkbox"
                  onClick={(event) => {
                    const input = event.target as HTMLInputElement
                    if (ele.credentialDefinitionId) {
                      selectConnection(
                        ele.credentialDefinitionId,
                        input.checked,
                      )
                    }
                  }}
                  className="text-primary-700 focus:ring-primary-700 h-4 w-4 cursor-pointer rounded border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
              </div>
            ),
          },
        ],
      }))

      if (!credDefs.length) {
        setError('No Data Found')
      }
      setCredDefList(credDefs)
    } else {
      setError(response as string)
    }

    setLoading(false)
  }

  const getSchemaAndCredDef = async (): Promise<void> => {
    const selectedSchemaId = Array.isArray(schemaId) ? schemaId[0] : schemaId

    if (selectedSchemaId) {
      await getCredDefs(selectedSchemaId)

      const [, , schemaName = '', version = ''] = selectedSchemaId.split(':')
      setSchemaState({ schemaName, version })
    } else {
      setSchemaState({ schemaName: '', version: '' })
    }
  }

  useEffect(() => {
    dispatch(resetCredDefId())
    getSchemaAndCredDef()
  }, [])

  const header = [
    { columnName: 'Name' },
    { columnName: 'Credential definition Id' },
    { columnName: 'Revocable' },
    { columnName: 'Select' },
  ]

  return (
    <div className="px-4 pt-2">
      <div className="col-span-full mb-4 xl:mb-2">
        <div className="flex items-center justify-between">
          <BackButton path={pathRoutes.organizations.verification.email} />
        </div>
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Schema
        </h1>
      </div>

      <div className="col-span-full mb-4 pb-3 xl:mb-2">
        {!schema.schemaId ? (
          <div className="mb-4 flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="gap4 m-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <SchemaCard
              className="col-span-1 sm:col-span-2 md:col-span-1"
              schemaName={schemaState.schemaName}
              version={schemaState.version}
              schemaId={schema.schemaId}
              issuerDid={schema.issuerDid}
              attributes={schema.attributes}
              created={schema.createdDate}
              showCheckbox={false}
              isClickable={false}
            />
          </div>
        )}
      </div>

      <div className="col-span-full mb-4 pt-5 xl:mb-2">
        <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Credential definitions
        </h1>
      </div>

      <AlertComponent
        message={error}
        type="failure"
        onAlertClose={() => setError(null)}
      />

      <DataTable header={header} data={credDefList} loading={loading} />

      <div>
        <Button
          onClick={() => {
            router.push(`${pathRoutes.organizations.verification.connections}`)
          }}
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

export default CredDefSelection
