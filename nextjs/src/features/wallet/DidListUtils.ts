import { DidData, IFormValues } from './type/type'

import { DidMethod } from '@/common/enums'

export function getDidData({
  values,
  seed,
}: {
  values: IFormValues
  seed: string
}): DidData {
  let network = ''
  if (values.method === DidMethod.INDY) {
    network = values?.network || ''
  } else if (values.method === DidMethod.POLYGON) {
    network = `${values.ledger}:${values.network}`
  }
  return {
    seed: values.method === DidMethod.POLYGON ? '' : seed,
    keyType: 'ed25519',
    method: values.method?.split(':')[1] || '',
    network,
    domain: values.method === DidMethod.WEB ? values.domain : '',
    role: values.method === DidMethod.INDY ? 'endorser' : '',
    privatekey: values.method === DidMethod.POLYGON ? values.privatekey : '',
    did: values?.did ?? '',
    endorserDid: values?.endorserDid || '',
    isPrimaryDid: false,
  }
}
