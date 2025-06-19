import { DidMethod, SchemaTypes } from '@/common/enums'
import { IFetchOrganizationDetails, ISchema } from '../type/interface'

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { AxiosResponse } from 'axios'
import { apiStatusCodes } from '@/config/CommonConstant'
import { getOrganizationById } from '@/app/api/organization'
import { pathRoutes } from '@/config/pathRoutes'
import { setW3CSchemaAttributes } from '@/lib/verificationSlice'
import { store } from '@/lib/store'

export const fetchOrganizationDetails = async ({
  setLoading,
  organizationId,
  setWalletStatus,
  setW3cSchema,
  setSchemaType,
  setIsNoLedger,
}: IFetchOrganizationDetails): Promise<void> => {
  setLoading(true)
  try {
    const response = await getOrganizationById(organizationId)

    const { data } = response as AxiosResponse
    if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
      const did = data?.data?.org_agents?.[0]?.orgDid

      if (data?.data?.org_agents && data?.data?.org_agents?.length > 0) {
        setWalletStatus(true)
      }
      if (typeof did === 'string') {
        const isPolygon = did.includes(DidMethod.POLYGON)
        const isKey = did.includes(DidMethod.KEY)
        const isWeb = did.includes(DidMethod.WEB)
        const isIndy = did.includes(DidMethod.INDY)

        if (isPolygon || isKey || isWeb) {
          setW3cSchema(true)
          setSchemaType(SchemaTypes.schema_W3C)
        }

        if (isIndy) {
          setW3cSchema(false)
          setSchemaType(SchemaTypes.schema_INDY)
        }

        if (isKey || isWeb) {
          setIsNoLedger(true)
        }
      }
    }
    setLoading(false)
  } catch (error) {
    console.error('Error fetching organization details:', error)
    setLoading(false)
  }
}

export const handleW3CSchemaDetails = async ({
  selectedSchemaState,
  route,
}: {
  selectedSchemaState: ISchema[]
  route: AppRouterInstance
}): Promise<void> => {
  const w3cSchemaAttributes = selectedSchemaState
    .filter((schema) => schema.schemaLedgerId)
    .map((schema) => ({
      schemaId: schema.schemaLedgerId ?? '',
      attributes: schema.attributes,
      schemaName: schema.name ?? '',
    }))

  store.dispatch(setW3CSchemaAttributes(w3cSchemaAttributes))
  route.push(`${pathRoutes.organizations.verification.w3cAttributes}`)
}
