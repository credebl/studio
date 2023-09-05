
interface SchemaCredDefProps {
    schemaCredDefList: object[]
}

const SchemaCredDefDetails = ({ schemaCredDefList }: SchemaCredDefProps) => {

    return (
        <>
            {schemaCredDefList.map((item, index) => (
                <div key={Object.values(item)[2]} className="flex justify-start ml-2 w-full mt-6">
                    <div className="w-full">
                        <div className="flex flex-start mb-2 w-full ">
                            <div className=" w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center">
                                Schema Id
                            </div>
                            <div className=" flex items-center p-1 m-1 ">:</div>{' '}
                            <div className="w-9/12 m-1 flex justify-start truncate text-gray-600  items-center">
                                {Object.values(item)[2]}
                            </div>
                        </div>
                        {Object.values(item)[1] ? (
                            <div className="flex flex-start mb-2 w-full ">
                                <div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center">
                                    {Object.values(item)[1] ? 'CredDef Id' : ''}
                                </div>{' '}
                                <div className="flex items-center p-1 m-1">
                                    {' '}
                                    :
                                </div>{' '}
                                <div className="w-9/12 m-1 flex justify-start truncate text-gray-600  items-center">
                                    {Object.values(item)[1]
                                        ? Object.values(item)[1].slice(0, 36)
                                        : ''}
                                </div>
                            </div>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            ))}
        </>
    )
}

export default SchemaCredDefDetails
