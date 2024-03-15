import React from 'react';
import { Card } from 'flowbite-react';
import CopyDid from '../commonComponents/CopyDid';

interface IProps {
    schemaName: string;
    version: string;
    credDefId: string;
    schemaId: string;
    hideCredDefId: boolean;
}

const SummaryCard = ({ schemaName, version, credDefId, schemaId, hideCredDefId }: Readonly<IProps>) => {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'>
            <Card>
                <div className="flex justify-between items-start">
                    <div>
                        <h5 className="text-xl font-bold leading-none dark:text-white">
                            {schemaName}
                        </h5>
                        <p className="dark:text-white">
                            Version: {version}
                        </p>
                    </div>
                </div>
                <div className="min-w-0 flex-1 issuance">
                    <p className="truncate dark:text-white break-all flex">
                        <span className="font-semibold mr-2">Schema ID: </span>
                        <span className='flex w-schema-id'>
                            <CopyDid value={schemaId || ""} className='truncate font-courier mt-[2px]' />
                        </span>
                    </p>
                    {
                        hideCredDefId ?
                            <p className="truncate dark:text-white break-all flex">
                                <span className="font-semibold mr-2">Credential definition restriction: </span>
                                <span className='flex'>
                                    {credDefId ? ' Yes' : ' No'}
                                </span>
                            </p>
                            :
                            <p className="truncate dark:text-white break-all flex">
                                <span className="font-semibold mr-2">Credential Definition: </span>
                                <span className='flex w-cred-id'>
                                    <CopyDid value={credDefId || ""} className='truncate font-courier mt-[2px]' />
                                </span>
                            </p>

                    }
                </div>
            </Card>
        </div>
    )
}

export default SummaryCard