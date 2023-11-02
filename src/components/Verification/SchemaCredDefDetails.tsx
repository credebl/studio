
interface SchemaCredDefProps {
    schemaCredDefList: object[]
}

const SchemaCredDefDetails = ({ schemaCredDefList }: SchemaCredDefProps) => {

    return (
        <>
            {schemaCredDefList.map((item) => (
                <div key={Object.values(item)[2]} className="flex justify-start ml-2 w-full mt-6">
                    <div className="w-full">
                      
                        {Object.values(item)[2] ? (
                            <div className="flex flex-start mb-2 w-full ">
                                <div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 text-start">
                                    {Object.values(item)[2] ? 'Schema Id' : ''}
                                </div>{' '}
                                <div className=" p-1 m-1">
                                    {' '}
                                    :
                                </div>{' '}
                                <div className="w-9/12 m-1 text-start text-gray-600 dark:text-white items-center cursor-pointer overflow-auto">
                                    {Object.values(item)[2]
                                        ? Object.values(item)[2]
                                        : ''}
                                </div>
                            </div>
                        ) : (
                            ''
                        )}

                        {Object.values(item)[1] ? (
                            <div className="flex flex-start mb-2 w-full ">
                                <div className="w-3/12 font-semibold text-primary-700 dark:bg-gray-800 m-1 p-1 flex justify-start items-center text-start">
                                    {Object.values(item)[1] ? 'CredDef Id' : ''}
                                </div>{' '}
                                <div className="flex items-center p-1 m-1">
                                    {' '}
                                    :
                                </div>{' '}
                                <div className="w-9/12 m-1 text-start text-gray-600 dark:text-white items-center cursor-pointer overflow-auto">
                                    {Object.values(item)[1]
                                        ? Object.values(item)[1]
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
