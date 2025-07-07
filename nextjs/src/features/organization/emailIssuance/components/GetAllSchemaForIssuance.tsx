import { AxiosResponse } from 'axios'
import { IAttributes } from '../type/EmailIssuance'
import { ICredentials } from '../../connectionIssuance/type/Issuance'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getAllSchemas } from '@/app/api/schema'

interface GetAllSchemaHelperUtilProps {
  schemaListAPIParameter: {
    itemPerPage: number
    page: number
    search: string
    sortBy: string
    sortingOrder: string
    allSearch: string
  }
  ledgerId: string
  currentSchemaType: string
}

export interface GetAllSchemaHelperReturn {
  value: string
  label: string
  schemaName: string
  type: string
  schemaVersion: string
  schemaIdentifier: string
  attributes: string | IAttributes[]
  id: string
  schemaId: string
  credentialId: string
}

export default async function getAllSchemaHelperUtil({
  schemaListAPIParameter,
  ledgerId,
  currentSchemaType,
}: GetAllSchemaHelperUtilProps): Promise<GetAllSchemaHelperReturn[]> {
  const response = await getAllSchemas(
    schemaListAPIParameter,
    currentSchemaType,
    ledgerId,
  )
  const { data } = response as AxiosResponse

  if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
    const credentialDefs = data.data.data
    const options = credentialDefs.map(
      ({ name, version, schemaLedgerId, attributes, type }: ICredentials) => ({
        value: version,
        label: `${name} [${version}]`,
        schemaName: name,
        type,
        schemaVersion: version,
        schemaIdentifier: schemaLedgerId,
        attributes: Array.isArray(attributes)
          ? attributes
          : attributes
            ? JSON.parse(attributes)
            : [],
      }),
    )
    return options ?? []
  } else {
    return []
  }
}
