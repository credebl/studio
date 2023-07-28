'use client';

import SchemaList from "../Resources/Schema/SchemasList";

const SchemaSelection = () => {

    const schemaSelectionCallback = (schemaId: string) => {
        window.location.href = `/organizations/issued-credentials/schemas/cred-defs?schemaId=${schemaId}`
    }

    return (
        <SchemaList schemaSelectionCallback={schemaSelectionCallback} />
    )
}

export default SchemaSelection
