import {
  IApiResponse,
  ICreateIssuerPayload,
  ICreateOfferPayload,
  ICreateTemplatePayload,
  ICredentialOffer,
  IIssuerDetails,
  IIssuerListItem,
  IReissueOfferPayload,
  ITemplate,
  IUpdateIssuerPayload,
  IUpdateOfferPayload,
  IUpdateTemplatePayload,
} from '@/app/oid4vc/interface/interface'
import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosPut,
} from '@/services/apiRequests'

import { AxiosResponse } from 'axios'
import { apiRoutes } from '@/config/apiRoutes'
import { getHeaderConfigs } from '@/config/GetHeaderConfigs'

const orgUrl = (orgId: string): string =>
  `${apiRoutes.organizations.root}/${orgId}`

const issuerUrl = (orgId: string, issuerId: string): string =>
  `${orgUrl(orgId)}${apiRoutes.oid4vc.issuers}/${issuerId}`

const templateUrl = (
  orgId: string,
  issuerId: string,
  templateId?: string,
): string =>
  `${orgUrl(orgId)}${apiRoutes.oid4vc.issuerTemplates}/${issuerId}/template${
    templateId ? `/${templateId}` : ''
  }`

export const createIssuer = async (
  orgId: string,
  payload: ICreateIssuerPayload,
): Promise<AxiosResponse<IApiResponse<IIssuerListItem>>> =>
  axiosPost({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.createIssuer}`,
    payload,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<IIssuerListItem>>>

export const getIssuers = async (
  orgId: string,
): Promise<AxiosResponse<IApiResponse<IIssuerListItem[]>>> =>
  axiosGet({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.issuers}`,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<IIssuerListItem[]>>>

export const getIssuerById = async (
  orgId: string,
  issuerId: string,
): Promise<AxiosResponse<IApiResponse<IIssuerDetails>>> =>
  axiosGet({
    url: issuerUrl(orgId, issuerId),
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<IIssuerDetails>>>

export const updateIssuer = async (
  orgId: string,
  issuerId: string,
  payload: IUpdateIssuerPayload,
): Promise<AxiosResponse<IApiResponse<IIssuerListItem>>> =>
  axiosPost({
    url: issuerUrl(orgId, issuerId),
    payload,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<IIssuerListItem>>>

export const deleteIssuer = async (
  orgId: string,
  issuerId: string,
): Promise<AxiosResponse<IApiResponse<unknown>>> =>
  axiosDelete({
    url: issuerUrl(orgId, issuerId),
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<unknown>>>

export const getTemplates = async (
  orgId: string,
  issuerId: string,
): Promise<AxiosResponse<IApiResponse<ITemplate[]>>> =>
  axiosGet({
    url: templateUrl(orgId, issuerId),
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<ITemplate[]>>>

export const getTemplateById = async (
  orgId: string,
  issuerId: string,
  templateId: string,
): Promise<AxiosResponse<IApiResponse<ITemplate>>> =>
  axiosGet({
    url: templateUrl(orgId, issuerId, templateId),
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<ITemplate>>>

export const createTemplate = async (
  orgId: string,
  issuerId: string,
  payload: ICreateTemplatePayload,
): Promise<AxiosResponse<IApiResponse<ITemplate>>> =>
  axiosPost({
    url: templateUrl(orgId, issuerId),
    payload,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<ITemplate>>>

export const updateTemplate = async (
  orgId: string,
  issuerId: string,
  templateId: string,
  payload: IUpdateTemplatePayload,
): Promise<AxiosResponse<IApiResponse<ITemplate>>> =>
  axiosPatch({
    url: templateUrl(orgId, issuerId, templateId),
    payload,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<ITemplate>>>

export const deleteTemplate = async (
  orgId: string,
  issuerId: string,
  templateId: string,
): Promise<AxiosResponse<IApiResponse<unknown>>> =>
  axiosDelete({
    url: templateUrl(orgId, issuerId, templateId),
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<unknown>>>

export const getCredentialOffers = async (
  orgId: string,
  publicIssuerId?: string,
): Promise<AxiosResponse<IApiResponse<ICredentialOffer[]>>> => {
  const query = publicIssuerId
    ? `?publicIssuerId=${encodeURIComponent(publicIssuerId)}`
    : ''

  return axiosGet({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.credentialOffers}${query}`,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<ICredentialOffer[]>>>
}

export const getCredentialOfferById = async (
  orgId: string,
  offerId: string,
): Promise<AxiosResponse<IApiResponse<ICredentialOffer>>> =>
  axiosGet({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.credentialOffers}/${offerId}`,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<ICredentialOffer>>>

export const createCredentialOffer = async (
  orgId: string,
  issuerId: string,
  payload: ICreateOfferPayload,
): Promise<AxiosResponse<IApiResponse<unknown>>> =>
  axiosPost({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.createOffer}/${issuerId}/create-offer`,
    payload,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<unknown>>>

export const updateCredentialOffer = async (
  orgId: string,
  issuerId: string,
  credentialId: string,
  payload: IUpdateOfferPayload,
): Promise<AxiosResponse<IApiResponse<unknown>>> =>
  axiosPut({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.createOffer}/${issuerId}/${credentialId}/update-offer`,
    payload,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<unknown>>>

export const reissueCredentialOffer = async (
  orgId: string,
  offerId: string,
  payload: IReissueOfferPayload = {},
): Promise<AxiosResponse<IApiResponse<unknown>>> =>
  axiosPost({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.credentialOffers}/${offerId}/reissue`,
    payload,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<unknown>>>

export const deleteCredentialOffer = async (
  orgId: string,
  credentialId: string,
): Promise<AxiosResponse<IApiResponse<unknown>>> =>
  axiosDelete({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.deleteOffer}/${credentialId}/delete-offer`,
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<unknown>>>

export const revokeCredential = async (
  orgId: string,
  issuanceSessionId: string,
): Promise<AxiosResponse<IApiResponse<unknown>>> =>
  axiosPost({
    url: `${orgUrl(orgId)}${apiRoutes.oid4vc.revokeCredential}/${issuanceSessionId}/revoke`,
    payload: {},
    config: getHeaderConfigs(),
  }) as Promise<AxiosResponse<IApiResponse<unknown>>>
