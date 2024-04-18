import { Button } from "flowbite-react";
import React, { useEffect, useState, type ChangeEvent } from "react";
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "../../api/Auth";
import { apiStatusCodes, emailCredDefHeaders, storageKeys } from "../../config/CommonConstant";
import { pathRoutes } from "../../config/pathRoutes";
import BreadCrumbs from "../BreadCrumbs";
import { AlertComponent } from "../AlertComponent";
import type { CredDefData } from "./interface";
import type { TableData } from "../../commonComponents/datatable/interface";
import DataTable from "../../commonComponents/datatable";
import { getCredentialDefinitionsForVerification } from "../../api/verification";
import BackButton from '../../commonComponents/backbutton';
import SearchInput from '../SearchInput';
import { getSchemaById } from "../../api/Schema";
import type { AxiosResponse } from "axios";
import CustomCheckbox from "../../commonComponents/CustomCheckbox";

const EmailCredDefSelection = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [credDefList, setCredDefList] = useState<TableData[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedCredDefs, setSelectedCredDefs] = useState<CredDefData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            await removeFromLocalStorage(storageKeys.CRED_DEF_ID);
            getSchemaAndCredDef();
        };

        fetchData();
    }, []);

    const getSchemaAndCredDef = async () => {
        try {
            const schemaIdsJSON = await getFromLocalStorage(storageKeys.SCHEMA_IDS);
            const schemaIds = schemaIdsJSON ? JSON.parse(schemaIdsJSON) : [];

            if (schemaIds && schemaIds.length > 0) {
                getCredDefs(schemaIds);
            }
        } catch (error) {
            console.error('Error fetching schema details:', error);
        }
    };

    const handleContinue = () => {
        window.location.href = `${pathRoutes.organizations.verification.attributes}`;
    };

    const getCredDefs = async (schemaIds: string[]) => {
        setLoading(true);
        const orgId = await getFromLocalStorage(storageKeys.ORG_ID);
        let allCredDefs: TableData[] = [];
        let rawCredDefs: CredDefData[] = []; 

        for (const schemaId of schemaIds) {
            try {
                const response = await getCredentialDefinitionsForVerification(schemaId);

                const { data } = response as AxiosResponse;

                if (data?.statusCode === apiStatusCodes.API_STATUS_SUCCESS) {
                    const getSchemaDetails = await getSchemaById(schemaId, orgId);
                    const schemaName = getSchemaDetails?.data?.data?.schema?.name;

                    const credDefs = data?.data?.map((ele: CredDefData) => {
                        rawCredDefs.push(ele);

                        return {
                            data: [
                                {
                                    data: (
                                        <div className="flex items-center space-x-4">

                                            <CustomCheckbox
                                                showCheckbox={true}
                                                isVerificationUsingEmail={true}
                                                onChange={(checked: boolean) => {
                                                    selectConnection(ele?.credentialDefinitionId, checked);
                                                }}
                                            />
                                            <span>{ele?.tag ? ele?.tag : 'Not available'}</span>
                                        </div>
                                    )
                                },
                                { data: schemaName || 'Not available' },
                                { data: ele?.revocable === true ? <span className="text-blue-700 dark:text-white">Yes</span> : <span className="text-cyan-500 dark:text-white">No</span> }
                            ]
                        };
                    });

                    allCredDefs = [...allCredDefs, ...credDefs];

                } else {
                    console.error(`Error fetching credential definitions for schema ${schemaId}`);
                }
            } catch (error) {
                console.error(`Error fetching credential definitions for schema ${schemaId}:`, error);
            }
        }

        setLoading(false);
        setCredDefList(allCredDefs);
        await setToLocalStorage(storageKeys.SCHEMA_CRED_DEFS, rawCredDefs);

        if (allCredDefs.length === 0) {
            setError('No Credential Definitions Found');
        }
    };

    const selectConnection = async (credDefId: string, checked: boolean) => {
        if (!credDefId) return;
    
        const getRawCredDefs = await getFromLocalStorage(storageKeys.SCHEMA_CRED_DEFS);
        const parsedRawCredDefs = JSON.parse(getRawCredDefs);
    
        const selectedCredDef = parsedRawCredDefs.find(
            (credDef: CredDefData) => credDef.credentialDefinitionId === credDefId
        );
    
        if (selectedCredDef) {
            setSelectedCredDefs((prevSelected) => {
                if (checked) {
                    const isAlreadySelected = prevSelected.some(
                        (credDef) => credDef.credentialDefinitionId === selectedCredDef.credentialDefinitionId
                    );
    
                    if (!isAlreadySelected) {
                        const newSelected = [...prevSelected, selectedCredDef];
                        setToLocalStorage(storageKeys.CRED_DEF_DATA, JSON.stringify(newSelected));
                        return newSelected;
                    }
                } else {
                    const newSelected = prevSelected.filter(
                        (credDef) => credDef.credentialDefinitionId !== selectedCredDef.credentialDefinitionId
                    );
                    setToLocalStorage(storageKeys.CRED_DEF_DATA, JSON.stringify(newSelected));
                    return newSelected;
                }
    
                return prevSelected;
            });
        }
    };
    
    
    
    return (
        <div className="px-4 pt-2">
            <div className="mb-4 col-span-full xl:mb-2">
                <div className="flex justify-between items-center">
                    <BreadCrumbs />
                    <BackButton path={pathRoutes.organizations.verification.email} />
                </div>
                <div className="flex mt-2 justify-between flex-wrap gap-4 items-center">
                    <h1 className="ml-1 text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                        Credential-definition
                    </h1>
                    <SearchInput value={searchValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)} />
                </div>
            </div>

            {error && (
                <AlertComponent
                    message={error}
                    type={'failure'}
                    onAlertClose={() => {
                        setError(null);
                    }}
                />
            )}
            <DataTable header={emailCredDefHeaders} data={credDefList} loading={loading} isEmailVerification={true} callback={() => { }} />
            <div>
                <Button onClick={handleContinue}
                	disabled={selectedCredDefs.length === 0}
                    className='text-base font-medium text-center text-white bg-primary-700 hover:!bg-primary-800 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mt-2 ml-auto'
                >
                    <svg className="pr-2" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24">
                        <path fill="#fff" d="M12.516 6.444a.556.556 0 1 0-.787.787l4.214 4.214H4.746a.558.558 0 0 0 0 1.117h11.191l-4.214 4.214a.556.556 0 0 0 .396.95.582.582 0 0 0 .397-.163l5.163-5.163a.553.553 0 0 0 .162-.396.576.576 0 0 0-.162-.396l-5.163-5.164Z" />
                        <path fill="#fff" d="M12.001 0a12 12 0 0 0-8.484 20.485c4.686 4.687 12.283 4.687 16.969 0 4.686-4.685 4.686-12.282 0-16.968A11.925 11.925 0 0 0 12.001 0Zm0 22.886c-6 0-10.884-4.884-10.884-10.885C1.117 6.001 6 1.116 12 1.116s10.885 4.885 10.885 10.885S18.001 22.886 12 22.886Z" />
                    </svg>
                    Continue
                </Button>
            </div>
        </div>
    );
};

export default EmailCredDefSelection;

