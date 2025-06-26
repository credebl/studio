'use client'

import SchemaList from './SchemaList'
import { setSelectedSchema } from '@/lib/schemaSlice'
import { useAppDispatch } from '@/lib/hooks'

const SchemaSelection = (): React.JSX.Element => {
  const dispatch = useAppDispatch()
  const schemaSelectionCallback1 = async (
    schemaId: string,
    // fix this later
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
