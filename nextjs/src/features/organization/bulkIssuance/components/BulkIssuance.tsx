/* eslint-disable max-lines */
'use client'

import { ArrowLeft, Download, History, Plus } from 'lucide-react'
import {
  DownloadSchemaTemplate,
  confirmCredentialIssuance,
  getSchemaCredentials,
} from './BulkIssuanceFunctions'
import { Features, SchemaTypes } from '@/common/enums'
import {
  IAttributes,
  ICredentials,
  IUploadMessage,
} from '../../connectionIssuance/type/Issuance'
import { Option, SearchableSelect } from '@/components/ShadCnSelect'
import React, { JSX, useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { apiStatusCodes, itemPerPage } from '@/config/CommonConstant'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Create from '@/features/schemas/components/Create'
import DragAndDrop from './DragAndDrop'
import { ICredentialOptions } from '../type/BulkIssuance'
import IssuancePopup from './IssuancePopup'
import ResetIssue from './ResetIssue'
import RoleViewButton from '@/components/RoleViewButton'
import { RootState } from '@/lib/store'
import SOCKET from '@/config/SocketConfig'
import Steps from './Steps'
import Table from './Table'
import { getCsvFileData } from '@/app/api/BulkIssuance'
import { pathRoutes } from '@/config/pathRoutes'
import { useAppSelector } from '@/lib/hooks'
import { useRouter } from 'next/navigation'

export interface SelectRef {
  clearValue(): void
}
const BulkIssuance = (): JSX.Element => {
  const [csvData, setCsvData] = useState<string[][]>([])
  const [requestId, setRequestId] = useState('')
  const [loading, setLoading] = useState<boolean>(true)
  const [credentialOptionsData, setCredentialOptionsData] =
    useState<ICredentialOptions>()
  const [credentialSelected, setCredentialSelected] =
    useState<ICredentials | null>()
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [uploadMessage, setUploadMessage] = useState<IUploadMessage | null>(
    null,
  )
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [mounted, setMounted] = useState<boolean>(false)
  const [schemaType, setSchemaType] = useState<SchemaTypes>()
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>()
  const [isAllSchema, setIsAllSchema] = useState<boolean>()
  const [attributes, setAttributes] = useState<IAttributes[]>([])
  const schemaListAPIParameters = {
    itemPerPage,
    page: 1,
    search: '',
    sortBy: 'id',
    sortingOrder: 'desc',
    allSearch: '',
  }
  const isCredSelected = Boolean(credentialSelected)

  const initialPageState = {
    pageNumber: 1,
    pageSize: 10,
    total: 0,
  }
  const [currentPage, setCurrentPage] = useState(initialPageState)

  const orgId = useAppSelector((state: RootState) => state.organization.orgId)

  const router = useRouter()

  const socketId = useAppSelector((state: RootState) => state.socket.SOCKET_ID)

  const onSelectChange = (newValue: ICredentials | undefined): void => {
    const value = newValue
    if (schemaType === SchemaTypes.schema_INDY) {
      setSelectedTemplate(value?.credentialDefinitionId)
      setCredentialSelected(value ?? null)
    } else if (schemaType === SchemaTypes.schema_W3C) {
      setCredentialSelected(value ?? null)
      setSelectedTemplate(value?.schemaIdentifier)
    }
    setAttributes(value?.schemaAttributes ?? value?.attributes ?? [])
  }

  const handleSelect = (value: Option): void => {
    const safeValue = {
      ...value,
      schemaIdentifier: value?.schemaIdentifier ?? '',
      schemaName: value.schemaName ?? '',
      schemaVersion: value.schemaVersion ?? '',
    }
    onSelectChange(safeValue)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    SOCKET.emit('bulk-connection')
    SOCKET.on('bulk-issuance-process-completed', () => {
      setSuccess(null)
      // eslint-disable-next-line no-console
      console.log('bulk-issuance-process-completed')
      toast.success('Issuance process completed', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      })
    })

    SOCKET.on('error-in-bulk-issuance-process', () => {
      setFailure(null)
      // eslint-disable-next-line no-console
      console.log('error-in-bulk-issuance-process-initiated')
      toast.error('Issuance process failed. Please retry', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
      })
    })
  }, [])

  const handleCsvFileData = async (requestId: string): Promise<void> => {
    setLoading(true)
    if (requestId) {
      try {
        const response = await getCsvFileData(
          requestId,
          currentPage.pageNumber,
          currentPage.pageSize,
          '',
          orgId,
        )
        const { data } = response as AxiosResponse
        if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
          const totalPages = data?.data?.response?.lastPage
          setLoading(false)
          setCsvData(data?.data?.response?.data)
          setCurrentPage({
            ...currentPage,
            total: totalPages,
          })
        }
      } catch (err) {
        console.error('Error in bulk issuance', err)
        setLoading(false)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    const getData: NodeJS.Timeout | null = null

    handleCsvFileData(requestId)

    return () => clearTimeout(getData ?? undefined)
  }, [currentPage.pageNumber])

  const handleCloseConfirmation = (): void => {
    setOpenModal(false)
  }
  const selectInputRef = React.useRef<SelectRef | null>(null)

  const createSchemaTitle = { title: 'Create Schema', svg: <Create /> }

  const context = {
    setLoading,
    setUploadMessage,
    setSuccess,
    setFailure,
    socketId,
    setUploadedFileName,
    schemaType,
    selectedTemplate,
    orgId,
    setRequestId,
    setIsFileUploaded,
    currentPage,
    setCsvData,
    setCurrentPage,
    isCredSelected,
    setIsAllSchema,
    setSchemaType,
    isAllSchema,
    setCredentialOptionsData,
    requestId,
    setCredentialSelected,
    setOpenModal,
    selectInputRef,
    isFileUploaded,
    uploadedFileName,
    uploadMessage,
  }

  useEffect(() => {
    getSchemaCredentials(schemaListAPIParameters, context)
  }, [isAllSchema])

  return (
    <div className="px-4 pt-2">
      <div className="col-span-full mb-4 xl:mb-2">
        <div className="flex items-center justify-end">
          <Button
            onClick={() => router.push(pathRoutes.organizations.Issuance.issue)}
          >
            <ArrowLeft /> Back
          </Button>
        </div>
      </div>
      <div>
        <ToastContainer />
        <div className="mb-4 ml-1 flex items-center justify-between">
          <div>
            <p className="text-2xl font-semibold dark:text-white">
              Bulk Issuance
            </p>
            <span className="text-sm text-gray-400">
              Upload a .CSV file for bulk issuance
            </span>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            <Button
              color="bg-primary-800"
              className="group bg-secondary-700 ring-primary-900 bg-white-700 hover:bg-secondary-700 text-primary-600 border-primary-650 hover:text-primary-600 dark:text-custom-100 dark:border-blue-450 dark:hover:text-primary-700 dark:hover:bg-secondary-700 ml-auto flex shrink-0 rounded-md px-2 py-2 text-lg font-medium ring-2 lg:px-3 lg:py-2.5"
              style={{ height: '2rem', minWidth: '2rem' }}
              onClick={() => {
                router.push(pathRoutes.organizations.Issuance.history)
              }}
            >
              <History />
              <span className="text-custom-900 dark:text-custom-100 group-hover:text-custom-900">
                View History
              </span>
            </Button>

            <RoleViewButton
              buttonTitle={createSchemaTitle.title}
              feature={Features.CRETAE_SCHEMA}
              svgComponent={<Plus />}
              onClickEvent={() => {
                router.push(`${pathRoutes.organizations.createSchema}`)
              }}
              isPadding={createSchemaTitle.title !== 'Create Schema'}
            />
          </div>
        </div>
        {(success || failure) && (
          <AlertComponent
            message={success ?? failure}
            type={success ? 'success' : 'failure'}
            onAlertClose={() => {
              setSuccess(null)
              setFailure(null)
            }}
            viewButton={Boolean(
              (success && success === 'Issuance process completed') ||
                (failure &&
                  failure === 'Issuance process failed, please retry'),
            )}
            path={pathRoutes.organizations.Issuance.history}
          />
        )}
        <div className="min-h-100/21rem flex flex-col justify-between">
          <Card className="p-5">
            <div>
              <div className="grid w-[980px] grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col justify-between">
                  <div>
                    {mounted && (
                      <SearchableSelect
                        className="border-primary max-w-lg border-2"
                        options={
                          Array.isArray(credentialOptionsData)
                            ? credentialOptionsData
                            : []
                        }
                        value={''}
                        onValueChange={handleSelect}
                        placeholder="Select Schema Credential Definition"
                      />
                    )}
                  </div>
                  <div className="mt-4">
                    {credentialSelected && (
                      <Card className="max-w-[30rem] p-5">
                        <div>
                          <p className="pb-2 text-black dark:text-white">
                            <span className="font-semibold">Schema: </span>
                            {credentialSelected?.schemaName || ''}{' '}
                            <span>[{credentialSelected?.schemaVersion}]</span>
                          </p>
                          {schemaType === SchemaTypes.schema_INDY && (
                            <p className="pb-2 text-black dark:text-white">
                              {' '}
                              <span className="font-semibold">
                                Credential Definition:
                              </span>{' '}
                              {credentialSelected?.credentialDefinition}
                            </p>
                          )}

                          <span className="font-semibold text-black dark:text-white">
                            Attributes:
                          </span>
                          <div className="flex flex-wrap overflow-hidden">
                            {attributes?.map((element: IAttributes) => (
                              <div key={element.attributeName}>
                                <span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors">
                                  {element.attributeName}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button
                      id="signinsubmit"
                      type="submit"
                      variant="ghost"
                      className="border-ring hover:bg-primary flex items-center rounded-xl border px-4 py-2 transition-colors"
                      style={{ height: '2.4rem', minWidth: '2rem' }}
                      disabled={!isCredSelected}
                      onClick={() =>
                        schemaType &&
                        DownloadSchemaTemplate(
                          credentialSelected,
                          schemaType,
                          selectedTemplate,
                          orgId,
                          setSuccess,
                          setUploadMessage,
                          setFailure,
                          setLoading,
                        )
                      }
                    >
                      <Download />
                      <span>Download Template</span>
                    </Button>
                  </div>
                </div>
                {/* ---------------- */}
                <DragAndDrop context={context} />
              </div>
            </div>
          </Card>
          <Table csvData={csvData} />
          <div>
            {!isCredSelected && <Steps />}

            <IssuancePopup
              openModal={openModal}
              closeModal={handleCloseConfirmation}
              isProcessing={loading}
              onSuccess={() => confirmCredentialIssuance(context)}
            />

            <ResetIssue context={context} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkIssuance
