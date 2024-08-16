
import CopyDid from "../../commonComponents/CopyDid"

interface SchemaCredDefProps {
    schemaCredDefList: {
        name: string;
        credDefId?: string; 
        schemaId: string; 
    }[];
}

const IdDisplay = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-start mb-2 w-full">
        <div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center text-start">
            {label}
        </div>
        <div className="flex items-center p-1 m-1">:</div>
        <div className="w-9/12 m-1 text-start text-gray-600 dark:text-white items-center cursor-pointer overflow-auto">
            <div className="flex w-full">
                <CopyDid value={value} className='truncate font-courier mt-2' />
            </div>
        </div>
    </div>
);

const SchemaCredDefDetails = ({ schemaCredDefList }: SchemaCredDefProps) => {
    return (
        <>
            {schemaCredDefList.map((item, index) => (
                <div key={item.schemaId} className="flex justify-start ml-2 w-full mt-6">
                    <div className="w-full">
                        {item.schemaId && !item.credDefId && (
                            <IdDisplay label="Schema Id" value={item.schemaId} />
                        )}
                        {item.schemaId && item.credDefId && (
                            <>
                                <IdDisplay label="Schema Id" value={item.schemaId} />
                                <IdDisplay label="CredDef Id" value={item.credDefId} />
                            </>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
}

export default SchemaCredDefDetails;

