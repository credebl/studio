import { DidMethod, SchemaTypes } from '@/common/enums'
import {
  DownloadCsvTemplate,
  getCsvFileData,
  getSchemaCredDef,
  issueBulkCredential,
  uploadCsvFile,
} from '@/app/api/BulkIssuance'
import {
  GetAllSchemaListParameter,
  IContext,
  ICredentials,
  IDownloadSchemaTemplate,
} from '../type/BulkIssuance'
import { handleDiscardFile, onClear } from './BulkIssuanceUtils'

import { AxiosResponse } from 'axios'
import { IAttributes } from '../../emailIssuance/type/EmailIssuance'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getAllSchemas } from '@/app/api/schema'
import { getOrganizationById } from '@/app/api/organization'
import { setSocketId } from '@/lib/socketSlice'
import { store } from '@/lib/store'

const downloadFile = (url: string, fileName: string): void => {
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const DownloadSchemaTemplate: IDownloadSchemaTemplate = async (
  credentialSelected,
  schemaType,
  selectedTemplate,
  orgId,
  setSuccess,
  setUploadMessage,
  setFailure,
  setLoading,
): Promise<void> => {
  if (credentialSelected) {
    try {
      if (!schemaType) {
        return
      }
      const response = await DownloadCsvTemplate(
        selectedTemplate || '',
        schemaType,
        orgId,
      )
      const { data } = response as AxiosResponse

      if (data) {
        const fileUrl = data
        if (fileUrl) {
          downloadFile(fileUrl, 'downloadedFile.csv')
          setSuccess('File downloaded successfully')
          setTimeout(() => {
            setSuccess(null)
          }, 5000)
        } else {
          setUploadMessage({
            message: 'File URL is missing in the response',
            type: 'failure',
          })
          setTimeout(() => {
            setUploadMessage(null)
          }, 5000)
          setSuccess(null)
          setFailure(null)
        }
      } else {
        setUploadMessage({
          message: 'API request was not successful',
          type: 'failure',
        })
        setTimeout(() => {
          setUploadMessage(null)
        }, 5000)
        setSuccess(null)
        setFailure(null)
      }
    } catch (error) {
      setUploadMessage({ message: error as string, type: 'failure' })
      setTimeout(() => {
        setUploadMessage(null)
      }, 5000)
      setSuccess(null)
      setFailure(null)
    }
  }

  setLoading(false)
}

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

const handleCsvFileData = async (
  requestId: string,
  context: IContext,
): Promise<void> => {
  context.setLoading(true)
  if (requestId) {
    try {
      const response = await getCsvFileData(
        requestId,
        context.currentPage.pageNumber,
        context.currentPage.pageSize,
        '',
        context.orgId,
      )
      const { data } = response as AxiosResponse
      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const totalPages = data?.data?.response?.lastPage
        context.setLoading(false)
        context.setCsvData(data?.data?.response?.data)
        context.setCurrentPage({
          ...context.currentPage,
          total: totalPages,
        })
      }
    } catch (err) {
      console.error('Error in bulk issuance', err)
      context.setLoading(false)
    }
  }
  context.setLoading(false)
}

const readFileAsBinary = (file: File): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event): void => {
      if (event.target?.result) {
        const binaryData = new Uint8Array(event.target.result as ArrayBuffer)
        resolve(binaryData)
      } else {
        reject(new Error('Failed to read file as binary.'))
      }
    }

    reader.onerror = (event): void => {
      reject(new Error(`File reading failed: ${event}`))
    }

    reader.readAsArrayBuffer(file)
  })

export const handleFileUpload = async (
  file: File,
  context: IContext,
): Promise<void> => {
  context.setLoading(true)

  if (file.type !== 'text/csv') {
    context.setUploadMessage({
      message: 'Invalid file type. Please select only CSV files.',
      type: 'failure',
    })
    setTimeout(() => {
      context.setUploadMessage(null)
    }, 5000)
    context.setSuccess(null)
    context.setFailure(null)
    return
  }
  try {
    const binaryData = await readFileAsBinary(file)

    const clientId = context.socketId

    store.dispatch(setSocketId(clientId))
    const payload = {
      file: binaryData,
      fileName: file?.name || 'Not available',
    }

    await wait(500)

    context.setUploadedFileName(file?.name)
    if (!context.schemaType) {
      return
    }

    const response = await uploadCsvFile(
      payload,
      context.selectedTemplate ?? '',
      context.schemaType,
      context.orgId,
    )
    const { data } = response as AxiosResponse

    if (data?.statusCode === apiStatusCodes?.API_STATUS_CREATED) {
      context.setLoading(false)
      context.setRequestId(data?.data)
      context.setIsFileUploaded(true)
      context.setUploadMessage({ message: data?.message, type: 'success' })
      setTimeout(() => {
        context.setUploadMessage(null)
      }, 5000)
      await handleCsvFileData(data?.data, context)
    } else {
      context.setUploadMessage({ message: response as string, type: 'failure' })
      setTimeout(() => {
        context.setUploadMessage(null)
      }, 5000)
      context.setSuccess(null)
      context.setFailure(null)
    }
    context.setLoading(false)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('ERROR - bulk issuance::', err)
  }
}

export const handleDrop = (
  e: React.DragEvent<HTMLDivElement>,
  context: IContext,
): void => {
  e.preventDefault()
  if (context.isCredSelected) {
    const [file] = Array.from(e.dataTransfer.files)
    if (file) {
      handleFileUpload(file, context)
    }
  }
}

export const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  context: IContext,
): void => {
  const { files } = e.target

  if (files && files.length > 0) {
    const [file] = Array.from(files)
    handleFileUpload(file, context)
  }
}

const resolveSchemaType = (
  orgDid: string | undefined,
  fallback: SchemaTypes,
): SchemaTypes => {
  if (
    orgDid?.includes(DidMethod.POLYGON) ||
    orgDid?.includes(DidMethod.KEY) ||
    orgDid?.includes(DidMethod.WEB)
  ) {
    return SchemaTypes.schema_W3C
  }
  if (orgDid?.includes(DidMethod.INDY)) {
    return SchemaTypes.schema_INDY
  }
  return fallback
}

export const getSchemaCredentials = async (
  schemaListAPIParameters: GetAllSchemaListParameter,
  context: IContext,
): Promise<void> => {
  try {
    context.setLoading(true)

    let orgDid: string | undefined = undefined
    let ledgerId = ''

    const response = await getOrganizationById(context.orgId)

    if (typeof response === 'string') {
      console.error('Error fetching organization:', response)
    } else {
      const { data } = response
      orgDid = data?.data?.org_agents[0]?.orgDid
      ledgerId = data.data.org_agents[0].ledgers.id
    }

    const currentSchemaType = resolveSchemaType(
      orgDid,
      context.schemaType ?? SchemaTypes.schema_INDY,
    )
    context.setSchemaType(currentSchemaType)

    let dropDownOptions = []

    if (
      (currentSchemaType === SchemaTypes.schema_INDY && context.isAllSchema) ||
      (currentSchemaType && context.orgId && !context.isAllSchema)
    ) {
      const response = await getSchemaCredDef(currentSchemaType, context.orgId)
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const { data: credentialDefsData } = data

        dropDownOptions = credentialDefsData.map(
          (
            {
              schemaName,
              schemaVersion,
              credentialDefinition,
              credentialDefinitionId,
              schemaIdentifier,
              schemaAttributes,
            }: ICredentials,
            index: number,
          ) => ({
            value:
              currentSchemaType === SchemaTypes.schema_INDY
                ? credentialDefinitionId
                : schemaVersion,
            label: [
              `${schemaName} [${schemaVersion}]`,
              currentSchemaType === SchemaTypes.schema_INDY
                ? `- (${credentialDefinition})`
                : null,
            ]
              .filter(Boolean)
              .join(' '),
            id: index,
            schemaName,
            schemaVersion,
            credentialDefinition,
            credentialDefinitionId,
            schemaIdentifier,
            schemaAttributes:
              schemaAttributes && typeof schemaAttributes === 'string'
                ? JSON.parse(schemaAttributes)
                : schemaAttributes,
          }),
        )

        context.setCredentialOptionsData(dropDownOptions)
      } else {
        context.setUploadMessage({
          message: response as string,
          type: 'failure',
        })
        context.setSuccess(null)
        context.setFailure(null)
      }
      context.setLoading(false)
    } else if (
      currentSchemaType === SchemaTypes.schema_W3C &&
      context.orgId &&
      context.isAllSchema
    ) {
      const response = await getAllSchemas(
        schemaListAPIParameters,
        currentSchemaType,
        ledgerId,
      )
      const { data } = response as AxiosResponse

      if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
        const credentialDefsData = data.data.data
        dropDownOptions = credentialDefsData.map(
          ({
            name,
            version,
            schemaLedgerId,
            attributes,
            type,
          }: ICredentials) => {
            let parsedAttributes: IAttributes[] = []

            if (Array.isArray(attributes)) {
              parsedAttributes = attributes
            } else if (attributes) {
              parsedAttributes = JSON.parse(attributes)
            }
            return {
              value: version,
              label: `${name} [${version}]`,
              schemaName: name,
              type,
              schemaVersion: version,
              schemaIdentifier: schemaLedgerId,
              attributes: parsedAttributes,
            }
          },
        )
        context.setCredentialOptionsData(dropDownOptions)
      } else {
        context.setUploadMessage({
          message: response as string,
          type: 'failure',
        })
        context.setSuccess(null)
        context.setFailure(null)
      }
      context.setLoading(false)
    }
  } catch (error) {
    context.setUploadMessage({
      message: (error as Error).message,
      type: 'failure',
    })
    context.setSuccess(null)
    context.setFailure(null)
  }
}

const handleResetForConfirm = (context: IContext): void => {
  handleDiscardFile(context)
  context.setCredentialSelected(null)
}

export const confirmCredentialIssuance = async (
  context: IContext,
): Promise<void> => {
  context.setLoading(true)
  const response = await issueBulkCredential(
    context.requestId,
    context.socketId,
    context.orgId,
  )
  const { data } = response as AxiosResponse
  if (data?.statusCode === apiStatusCodes.API_STATUS_CREATED) {
    if (data?.data) {
      context.setLoading(false)
      context.setOpenModal(false)
      context.setSuccess(data.message)
      context.setUploadMessage(null)
      handleResetForConfirm(context)
      onClear(context)
    } else {
      context.setFailure(response as string)
      setTimeout(() => {
        context.setFailure(null)
      }, 5000)
      context.setLoading(false)
    }
  } else {
    context.setLoading(false)
    context.setFailure(response as string)
    setTimeout(() => {
      context.setFailure(null)
    }, 5000)
  }
}
