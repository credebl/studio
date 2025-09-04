'use client'

import { JSX, useEffect, useState } from 'react'
import { apiStatusCodes, credDefHeader } from '@/config/CommonConstant'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AlertComponent } from '@/components/AlertComponent'
import { ArrowRight } from 'lucide-react'
import { AxiosResponse } from 'axios'
import BackButton from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import DataTable from '@/components/DataTable'
import { ITableData } from './SortDataTable'
import { ITableHtml } from '@/features/organization/connectionIssuance/type/Connections'
import Loader from '@/components/Loader'
import SchemaCard from '@/features/schemas/components/SchemaCard'
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
  const [credDefList, setCredDefList] = useState<ITableData[] | ITableHtml[]>(
    [],
  )

  const dispatch = useAppDispatch()
  const router = useRouter()

  const schema = useAppSelector((state) => state.schema)
  const schemaId = useAppSelector((state) => state.verification.schemaId)

  // Separate functions for clarity (fixes SonarQube issue)
  const selectCredDef = (credDefId: string): void => {
    dispatch(setCredDefId(credDefId))
  }

  const deselectCredDef = (): void => {
    dispatch(resetCredDefId())
  }

  const getCredDefs = async (schemaId: string): Promise<void> => {
    setLoading(true)
    const response = await getCredentialDefinitionsForVerification(schemaId)

    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const credDefs = (data?.data as CredentialDefinition[])?.map((ele) => ({
        data: [
          {
            data: (
              <div className="flex items-center">
                <input
                  id={`checkbox-${ele.credentialDefinitionId}`}
                  type="checkbox"
                  onChange={(event) => {
                    if (ele.credentialDefinitionId) {
                      event.target.checked
                        ? selectCredDef(ele.credentialDefinitionId)
                        : deselectCredDef()
                    }
                  }}
                  className="text-primary focus:ring-primary h-4 w-4 cursor-pointer rounded"
                />
              </div>
            ),
          },
          { data: ele?.tag ?? 'Not available' },
          { data: ele?.credentialDefinitionId ?? 'Not available' },
          {
            data: ele?.revocable ? (
              <span className="text-revocable-yes">Yes</span>
            ) : (
              <span className="text-revocable-no">No</span>
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

  const handleClick = (): void => {
    setLoading(true)
    try {
      router.push(`${pathRoutes.organizations.verification.connections}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-2">
      <div className="col-span-full mb-4 xl:mb-2">
        <div className="flex items-center justify-end">
          <BackButton path={pathRoutes.organizations.verification.email} />
        </div>
        <h1 className="ml-1 text-xl font-semibold sm:text-2xl">Schema</h1>
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

      <div className="col-span-full mb-4 flex pt-5 xl:mb-2">
        <h1 className="ml-1 text-xl font-semibold sm:text-2xl">
          Credential definitions
        </h1>
      </div>

      <AlertComponent
        message={error}
        type="failure"
        onAlertClose={() => setError(null)}
      />

      <DataTable header={credDefHeader} data={credDefList} loading={loading} />

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleClick}
          className="flex items-center gap-2 rounded-lg px-4 py-4 text-base font-medium sm:w-auto"
          disabled={loading}
        >
          {loading ? <Loader /> : <ArrowRight />}
          Continue
        </Button>
      </div>
    </div>
  )
}

export default CredDefSelection
