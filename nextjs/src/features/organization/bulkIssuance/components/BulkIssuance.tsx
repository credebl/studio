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
import { Option, SearchableSelect } from '@/components/SearchableSelect'
import React, { JSX, useEffect, useRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { apiStatusCodes, itemPerPage } from '@/config/CommonConstant'

import { AlertComponent } from '@/components/AlertComponent'
import { AxiosResponse } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
// import Combobox from '@/components/ui/combobox'
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

  const socketId = SOCKET.id || ''

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

  const allow = useRef<boolean>(true)

  useEffect(() => {
    SOCKET.emit('bulk-connection')
    SOCKET.on('bulk-issuance-process-completed', () => {
      setSuccess(null)
      // eslint-disable-next-line no-console
      console.log('bulk-issuance-process-completed')
      setTimeout(() => {
        allow.current = true
      }, 2000)
      if (allow.current) {
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
      }
      allow.current = false
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
            <p className="text-2xl font-semibold">Bulk Issuance</p>
            <span className="text-muted-foreground text-sm">
              Upload a .CSV file for bulk issuance
            </span>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            <Button
              // className="group border-ring hover:bg-primary hover:text-primary-foreground ml-auto flex shrink-0 items-center rounded-lg border px-4 py-1 transition-colors"
              className="h-[2.2rem] min-w-[2rem]"
              variant={'outline'}
              onClick={() => {
                router.push(pathRoutes.organizations.Issuance.history)
              }}
            >
              <History />
              <span className="">View History</span>
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
          <Card className="p-5 p-8">
            <div>
              <div className="grid w-[980px] grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col justify-between">
                  <div>
                    {mounted && (
                      <SearchableSelect
                        className="border-muted max-w-lg border-1"
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
                      <Card className="max-w-[30rem] border p-5">
                        <div>
                          <p className="pb-2">
                            <span className="font-semibold">Schema: </span>
                            {credentialSelected?.schemaName || ''}{' '}
                            <span>[{credentialSelected?.schemaVersion}]</span>
                          </p>
                          {schemaType === SchemaTypes.schema_INDY && (
                            <p className="pb-2">
                              {' '}
                              <span className="font-semibold">
                                Credential Definition:
                              </span>{' '}
                              {credentialSelected?.credentialDefinition}
                            </p>
                          )}

                          <span className="font-semibold">Attributes:</span>
                          <div className="mt-2 flex flex-wrap overflow-hidden">
                            {attributes
                              ?.slice(0, 3)
                              .map((element: IAttributes) => (
                                <div key={element.attributeName}>
                                  <span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded-lg px-2.5 py-2 text-sm font-medium shadow-sm transition-colors">
                                    {element.attributeName}
                                  </span>
                                </div>
                              ))}
                            {attributes?.length > 3 && (
                              <span className="text-muted-foreground ml-2 text-sm/6">
                                +{attributes.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                  <div className="mt-4">
                    <Button
                      id="signinsubmit"
                      type="submit"
                      variant="outline"
                      className="min-w-[2rem] rounded-xl"
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
