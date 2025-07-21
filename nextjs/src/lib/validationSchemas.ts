import * as yup from 'yup'

import { DidMethod } from '@/common/enums' // adjust the import based on your project

interface ValidationParams {
  haveDidShared: boolean
  selectedMethod: string
  includeLabel?: boolean
}

export const getDidValidationSchema = ({
  haveDidShared,
  selectedMethod,
  includeLabel = false,
}: ValidationParams): Record<string, yup.AnySchema> => ({
  ...(includeLabel && {
    label: yup
      .string()
      .required('Wallet label is required')
      .trim()
      .min(2, 'Wallet label must be at least 2 characters')
      .max(25, 'Wallet label must be at most 25 characters'),
  }),
  method: yup.string().required('Method is required'),
  ledger: yup.string().required('Ledger is required'),
  ...(haveDidShared && {
    seed: yup.string().required('Seed is required'),
    did: yup.string().required('DID is required'),
  }),
  ...((selectedMethod === DidMethod.INDY ||
    selectedMethod === DidMethod.POLYGON) && {
    network: yup.string().required('Network is required'),
  }),
  ...(selectedMethod === DidMethod.WEB && {
    domain: yup.string().required('Domain is required'),
  }),
})
