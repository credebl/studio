'use client';

import { useAppDispatch } from '@/lib/hooks';
import SchemaList from './SchemaList';
import { setSelectedSchema } from '@/lib/schemaSlice';

const SchemaSelection = () => {
  const dispatch = useAppDispatch();
  const schemaSelectionCallback1 = async (
    schemaId: string,
    attributes: any
  ) => {
    dispatch(
      setSelectedSchema({
        attributes: attributes.attribute,
        issuerDid: attributes.issuerDid,
        createdDate: attributes.createdDate,
        schemaId: schemaId
      })
    );
  };

  return <SchemaList schemaSelectionCallback={schemaSelectionCallback1} />;
};

export default SchemaSelection;
