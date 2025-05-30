/* eslint-disable max-lines */
'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ISelectedAttributes, NumberAttribute } from '../type/interface'
import { JSX, useEffect, useState } from 'react'
import { apiStatusCodes, predicatesConditions } from '@/config/CommonConstant'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

import { AxiosResponse } from 'axios'
import BackButton from '@/components/BackButton'
import { Button } from '@/components/ui/button'
import { ContinueIcon } from '@/components/iconsSvg'
import CustomCheckbox from '@/components/CustomCheckbox'
import DataTable from '@/components/DataTable'
import { DidMethod } from '@/common/enums'
import { ITableData } from '@/components/DataTable/interface'
import PageContainer from '@/components/layout/page-container'
import { TableHeader } from './SortDataTable'
import { X } from 'lucide-react'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { setSelectedAttributeData } from '@/lib/verificationSlice'
import { useRouter } from 'next/navigation'

const EmailAttributesSelection = (): JSX.Element => {
  const [attributeList, setAttributeList] = useState<ITableData[]>([])
  const [proofReqSuccess, setProofReqSuccess] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [display, setDisplay] = useState<boolean | undefined>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [attributeData, setAttributeData] = useState<
    ISelectedAttributes[] | null
  >(null)
  const [w3cSchema, setW3cSchema] = useState<boolean>(false)
  const [isConnectionProof, setIsConnectionProof] = useState<boolean>(false)

  const dispatch = useAppDispatch()
  const router = useRouter()
  const orgId = useAppSelector((state) => state.organization.orgId)

  const verificationRouteType = useAppSelector(
    (state) => state.verification.routeType,
  )

  const getSelectedCredDefData = useAppSelector(
    (state) => state.verification.CredDefData,
  )

  const selectedSchemaAttributes = useAppSelector(
    (state) => state.verification.schemaAttributes,
  )
  const ConnectionVerification = async (): Promise<void> => {
    if (verificationRouteType === 'Connection') {
      setIsConnectionProof(true)
    } else {
      setIsConnectionProof(false)
    }
  }
  useEffect(() => {
    ConnectionVerification()
  }, [])

  const handleAttributeChange = async (
    attributeName: string,
    changeType: 'checkbox' | 'input' | 'select',
    value: string | boolean,
    schemaId?: string | undefined,
    credDefId?: string | undefined,
  ): Promise<void> => {
    const updatedAttributes =
      attributeData?.map((attribute) => {
        if (
          attribute.attributeName === attributeName &&
          attribute.schemaId === schemaId &&
          attribute.credDefId === credDefId
        ) {
          switch (changeType) {
            case 'checkbox':
              return {
                ...attribute,
                isChecked: value as boolean,
                value: (value as boolean) ? attribute.value : '',
                selectedOption: attribute?.condition || 'Select',
                inputError: '',
                selectError: '',
              }
            case 'input':
              return {
                ...attribute,
                value: value as string,
                inputError: '',
              }
            case 'select':
              return {
                ...attribute,
                selectedOption: value as string,
                selectError: '',
              }
            default:
              return attribute
          }
        }
        return attribute
      }) ?? []

    setAttributeData(updatedAttributes)

    dispatch(setSelectedAttributeData(updatedAttributes))
  }

  const getOrgDetails = async (): Promise<void> => {
    setLoading(true)

    const response = await getOrganizationById(orgId)
    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid

      if (
        did.includes(DidMethod.POLYGON) ||
        did.includes(DidMethod.KEY) ||
        did.includes(DidMethod.WEB)
      ) {
        setW3cSchema(true)
      } else if (did.includes(DidMethod.INDY)) {
        setW3cSchema(false)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    getOrgDetails()
  }, [])

  const isInvalidNumberAttribute = (attribute: NumberAttribute): boolean => {
    const isOptionInvalid =
      attribute.selectedOption === null ||
      attribute.selectedOption === '' ||
      attribute.selectedOption === 'Select'
    const isValueInvalid = attribute.value === null || attribute.value === ''

    if (!isOptionInvalid && isValueInvalid) {
      setErrMsg('Value is required')
      return true
    } else if (!isValueInvalid && isOptionInvalid) {
      setErrMsg('Condition is required')
      return true
    }
    return false
  }

  const hasInvalidNumberAttributes = (): boolean => {
    const numberAttributes = attributeData?.filter(
      (attr) => attr.dataType === 'number' && attr.isChecked,
    )

    for (const attribute of numberAttributes || []) {
      if (isInvalidNumberAttribute(attribute)) {
        return true
      }
    }

    return false
  }
  const redirectToAppropriatePage = (): void => {
    switch (true) {
      case w3cSchema && isConnectionProof:
        router.push(pathRoutes.organizations.verification.W3CConnections)
        break
      case !w3cSchema && isConnectionProof:
        router.push(pathRoutes.organizations.verification.connections)
        break
      case w3cSchema && !isConnectionProof:
        router.push(pathRoutes.organizations.verification.w3cEmailVerification)
        break
      default:
        router.push(pathRoutes.organizations.verification.emailVerification)
        break
    }
  }
  const handleSubmit = (): void => {
    setErrMsg(null)

    if (hasInvalidNumberAttributes()) {
      setErrMsg('Please check the number fields.')
      return
    }

    redirectToAppropriatePage()
  }

  const loadAttributesData = async (): Promise<void> => {
    setLoading(true)

    try {
      setAttributeData([])
      if (w3cSchema) {
        const parsedW3CSchemaDetails = selectedSchemaAttributes
        if (
          Array.isArray(parsedW3CSchemaDetails) &&
          parsedW3CSchemaDetails.length > 0
        ) {
          const allAttributes = parsedW3CSchemaDetails.flatMap((schema) => {
            if (schema.attributes && Array.isArray(schema.attributes)) {
              return schema.attributes.map((attribute) => ({
                ...attribute,
                schemaName: schema.name,
                credDefName: '',
                schemaId: schema.schemaLedgerId,
                credDefId: '',
              }))
            }
            return []
          })

          const inputArray = allAttributes.map((attribute) => ({
            displayName: attribute.displayName,
            attributeName: attribute.attributeName,
            isChecked: false,
            value: '',
            condition: '',
            options: predicatesConditions,
            dataType: attribute.schemaDataType,
            schemaName: attribute.schemaName ?? '',
            credDefName: attribute.credDefName,
            schemaId: attribute.schemaId ?? '',
            credDefId: attribute.credDefId,
            selectedOption: 'Select',
            inputError: '',
            selectError: '',
          }))

          setAttributeData(inputArray)
        } else {
          console.error('W3C schema details are not in the expected format.')
        }
      } else {
        const selectedCredDefs = getSelectedCredDefData || []

        const parsedSchemaDetails = selectedSchemaAttributes || []

        if (
          Array.isArray(parsedSchemaDetails) &&
          parsedSchemaDetails.length > 0
        ) {
          const allAttributes = parsedSchemaDetails.flatMap((schema) => {
            if (schema.attributes && Array.isArray(schema.attributes)) {
              return schema.attributes.flatMap((attribute) => {
                const matchingCredDefs = Array.isArray(selectedCredDefs)
                  ? selectedCredDefs.filter(
                      (credDef) => credDef.schemaLedgerId === schema.schemaId,
                    )
                  : []
                return matchingCredDefs.map((credDef) => ({
                  displayName: attribute.displayName,
                  attributeName: attribute.attributeName,
                  isChecked: false,
                  value: '',
                  condition: '',
                  options: predicatesConditions,
                  dataType: attribute.schemaDataType,
                  schemaName: schema?.schemaId?.split(':')[2] || '',
                  credDefName: credDef.tag,
                  schemaId: schema.schemaId,
                  credDefId: credDef.credentialDefinitionId,
                  selectedOption: 'Select',
                  inputError: '',
                  selectError: '',
                }))
              })
            }
            return []
          })
          setAttributeData(allAttributes)
        } else {
          console.error('Parsed schema details are not in the expected format.')
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttributesData()
  }, [w3cSchema])

  const attributeFunction = async (): Promise<void> => {
    if (!attributeData) {
      return
    }

    const attributes: ITableData[] = attributeData.map((attribute) => {
      const commonCellProps = {
        inputType: 'custom',
      }

      return {
        data: [
          {
            ...commonCellProps,
            data: (
              <div className="flex items-center">
                <CustomCheckbox
                  showCheckbox={true}
                  isVerificationUsingEmail={true}
                  onChange={(checked: boolean) => {
                    handleAttributeChange(
                      attribute?.attributeName,
                      'checkbox',
                      checked,
                      attribute?.schemaId,
                      attribute?.credDefId,
                    )
                  }}
                  isSelectedSchema={false}
                />
              </div>
            ),
          },
          {
            ...commonCellProps,
            data: attribute?.displayName || '',
          },
          {
            ...commonCellProps,
            data: !w3cSchema ? (
              <div className="relative flex items-center">
                {attribute?.dataType === 'number' && (
                  <select
                    disabled={!attribute?.isChecked}
                    value={attribute?.selectedOption}
                    onChange={(e) =>
                      handleAttributeChange(
                        attribute?.attributeName,
                        'select',
                        e.target.value,
                        attribute?.schemaId,
                        attribute?.credDefId,
                      )
                    }
                    className={`${
                      !attribute?.isChecked
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    } border-border rounded-md border p-1`}
                  >
                    {attribute?.options?.map((option) => (
                      <option key={option?.value} value={option?.value}>
                        {option?.label}
                      </option>
                    ))}
                  </select>
                )}
                {attribute?.selectError && (
                  <div className="absolute bottom-[-16px] text-xs text-[--var(--destructive)]">
                    {attribute?.selectError}
                  </div>
                )}
              </div>
            ) : (
              <div />
            ),
          },
          {
            ...commonCellProps,
            data: !w3cSchema ? (
              <div className="relative flex flex-col items-start">
                {attribute?.dataType === 'number' && (
                  <input
                    type="number"
                    value={attribute?.value}
                    onChange={(e) =>
                      handleAttributeChange(
                        attribute?.attributeName,
                        'input',
                        e.target.value,
                        attribute?.schemaId,
                        attribute?.credDefId,
                      )
                    }
                    disabled={!attribute?.isChecked}
                    className={`${
                      !attribute?.isChecked
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                    } rounded-md border p-1`}
                  />
                )}
                {attribute?.inputError && (
                  <div className="absolute bottom-[-16px] text-xs text-[--var(--destructive)]">
                    {attribute?.inputError}
                  </div>
                )}
              </div>
            ) : (
              <div />
            ),
          },
          {
            ...commonCellProps,
            data: attribute.schemaName || '',
          },
          {
            ...commonCellProps,
            data: attribute.credDefName || '',
          },
        ],
      }
    })

    setAttributeList(attributes)
    setDisplay(attributeData.some((a) => a.dataType === 'number'))
  }

  useEffect(() => {
    const fetchAttributes = async (): Promise<void> => {
      if (attributeData) {
        await attributeFunction()
      }
    }

    fetchAttributes()
  }, [attributeData])

  const header = [
    { columnName: '', width: 'w-0.5' },
    { columnName: 'Attributes' },
    display && !w3cSchema ? { columnName: 'Condition' } : { columnName: '' },
    display && !w3cSchema
      ? { columnName: 'Value', width: 'w-0.75' }
      : { columnName: '' },
    { columnName: 'Schema Name' },
    !w3cSchema ? { columnName: 'Cred Def Name' } : { columnName: '' },
  ]

  return (
    <PageContainer>
      <div className="px-2 pt-2">
        <div className="col-span-full mb-4 xl:mb-2">
          <div className="flex w-full items-center justify-end">
            <BackButton
              path={
                w3cSchema
                  ? pathRoutes.organizations.verification.email
                  : pathRoutes.organizations.verification.emailCredDef
              }
            />
          </div>
        </div>

        {(proofReqSuccess || errMsg) && (
          <div className="relative p-2">
            <Alert
              className={`pr-10 ${
                proofReqSuccess ? 'text-success' : 'text-error'
              }`}
            >
              <AlertTitle className="font-semibold">
                {proofReqSuccess ? 'Success' : 'Error'}
              </AlertTitle>
              <AlertDescription>{proofReqSuccess ?? errMsg}</AlertDescription>
              <Button
                className="text-muted-foreground hover:text-foreground absolute top-3 right-3"
                onClick={() => {
                  setProofReqSuccess(null)
                  setErrMsg(null)
                }}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          </div>
        )}
        <div
          className={
            'font-montserrat flex flex-col text-left text-base leading-6 font-semibold tracking-normal sm:flex-row sm:justify-between sm:space-x-2'
          }
        >
          <h1 className="mr-auto ml-1 text-xl font-semibold sm:text-2xl">
            Attributes
          </h1>
        </div>
        <div className="mt-2 pt-2">
          <DataTable
            header={header.filter(Boolean) as TableHeader[]}
            data={attributeList}
            loading={loading}
          ></DataTable>
        </div>

        <div className="flex w-full items-center justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!attributeData?.some((ele) => ele.isChecked)}
            className="mt-2 ml-auto rounded-lg text-center text-base font-medium sm:w-auto"
          >
            <ContinueIcon />
            Continue
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default EmailAttributesSelection
