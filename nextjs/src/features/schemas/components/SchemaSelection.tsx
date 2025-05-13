'use client'

import SchemaList from './SchemaList'
import { setSelectedSchema } from '@/lib/schemaSlice'
import { useAppDispatch } from '@/lib/hooks'

const SchemaSelection = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const schemaSelectionCallback1 = async (
    schemaId: string,
    attributes: any,
  ): Promise<void> => {
    dispatch(
      setSelectedSchema({
        attributes: attributes.attribute,
        issuerDid: attributes.issuerDid,
        createdDate: attributes.createdDate,
        schemaId,
      }),
    )
  }

  return <SchemaList schemaSelectionCallback={schemaSelectionCallback1} />
}

export default SchemaSelection
