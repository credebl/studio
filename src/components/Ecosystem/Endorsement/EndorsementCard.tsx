import { Card } from 'flowbite-react';
import { dateConversion } from '../../../utils/DateConversion';
import DateTooltip from '../../../components/Tooltip';
import { EndorsementStatus, EndorsementType } from '../../../common/enums';
import StatusTabletTag from '../../../commonComponents/StatusTabletTag';
import { ICheckEcosystem, checkEcosystem } from '../../../config/ecosystem';
import { useEffect, useState } from 'react';

interface IProps {
    data: any,
    fromEndorsementList?: boolean,
    cardTransitionDisabled?: boolean
    allAttributes?: boolean
    onClickCallback?: (data: any) => void;
}

interface IAttributeData {
    data: string[],
    sliced: boolean
}

const EndorsementCard = ({ fromEndorsementList, data, onClickCallback, cardTransitionDisabled, allAttributes }: IProps) => {
    const [isEcosystemLead, setIsEcosystemLead] = useState(false);
    const isSchema = data?.type === EndorsementType.schema

    useEffect(() => {
        const checkEcosystemData = async () => {
            const data: ICheckEcosystem = await checkEcosystem();
            setIsEcosystemLead(data.isEcosystemLead)
        }
        checkEcosystemData();
    }, [])

    const isSliced = (list: string[]): boolean => {
        return Boolean(list && list?.length > 3)
    }

    const getAttributes = (): IAttributeData | null => {
        try {
            switch (true) {
                case isSchema:
                    if (requestData?.attr_names && requestData?.attr_names.length > 0) {
                        if (allAttributes) {
                            return {
                                data: requestData?.attr_names,
                                sliced: isSliced(requestData?.attr_names)
                            }
                        }
                        return {
                            data: requestData?.attr_names?.slice(0, 3),
                            sliced: isSliced(requestData?.attr_names)
                        }
                    }
                    return null
                case !isSchema:
                    if (data?.requestBody && data?.requestBody?.schemaDetails && data?.requestBody?.schemaDetails?.attributes && data?.requestBody?.schemaDetails?.attributes.length > 0) {
                        if (allAttributes) {
                            return {
                                data: data?.requestBody?.schemaDetails?.attributes,
                                sliced: isSliced(data?.requestBody?.schemaDetails?.attributes)
                            }
                        }
                        return {
                            data: data?.requestBody?.schemaDetails?.attributes?.slice(0, 3),
                            sliced: isSliced(data?.requestBody?.schemaDetails?.attributes)
                        }
                    }
                    return null
                default:
                    return null
            }
        } catch (err) {
            console.log("Attribute Error::", err)
            return null
        }
    }

    const enableAction = (!fromEndorsementList && data?.status === EndorsementStatus.signed) || Boolean(fromEndorsementList)

    const requestPayload = data?.requestPayload && JSON.parse(data?.requestPayload)

    const requestData = isSchema ? requestPayload?.operation?.data : requestPayload?.operation
    const attributesData: IAttributeData | null = getAttributes()

    return (
        <Card onClick={() => {
            if (enableAction && onClickCallback) {
                onClickCallback(data)
            }
        }}
            id="schema-cards"
            className={`${cardTransitionDisabled ? "" : "transform transition duration-500 hover:scale-105 hover:bg-gray-50 min-[w-320px]: cursor-default"}  ${enableAction && "lg:cursor-pointer cursor-default"}${cardTransitionDisabled ? "cursor-default" : "lg:cursor-not-allowed cursor-default"} ${cardTransitionDisabled && "shadow-none"} m-3 h-full`}
        >
            <div className="flex justify-between items-start">
                <div className='min-w-[6rem] max-w-100/13rem'>
                    <h5 className="text-xl font-bold leading-[1.1] text-gray-900 dark:text-white break-words truncate line-clamp-2 max-h-[43px] whitespace-normal" style={{ display: "-webkit-box" }}>
                        {isSchema ? requestData?.name : requestData?.tag}
                    </h5>
                    {
                        isSchema &&
                        <p className='dark:text-white'>
                            Version: {requestData?.version}
                        </p>
                    }
                </div>
                <div className='float-right ml-auto'>
                    <p className='dark:text-white'>
                        <DateTooltip date={data?.createDateTime}>
                            Requested: {dateConversion(data?.createDateTime)}
                        </DateTooltip >
                    </p >
                </div >
            </div >
            <div className='flex flex-wrap justify-between items-center'>
                {
                    data?.status &&
                    <div className='flex items-center mt-3 mr-2'>
                        <div className='dark:text-white'>
                            Status:
                        </div>
                        <div className='ml-4'>
                            <StatusTabletTag status={data?.status} />
                        </div>
                    </div>
                }
                <div className={`${isSchema ? "text-primary-700 bg-primary-100" : "bg-green-100 text-green-800"} w-fit py-1.5 px-3 rounded-md text-sm h-fit mt-3`}>
                    {isSchema ? "Schema" : "Credential Definition"}
                </div>
            </div>
            < div className="min-w-0 flex-none" >
                {!isSchema &&
                    <>
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                            <span className="font-semibold">Schema Name:</span> {data?.requestBody?.schemaDetails?.name || "-"}
                        </p>
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                            <span className="font-semibold">Schema Version:</span> {data?.requestBody?.schemaDetails?.version || "-"}
                        </p>
                    </>
                }
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Author DID:</span> {data?.authorDid}
                </p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Endorser DID:</span> {data?.endorserDid}
                </p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Ledger:</span> {data?.authorDid ? data?.authorDid?.split(":")[2] : "-"}
                </p>
                {isEcosystemLead &&
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        <span className="font-semibold">Organization:</span> {data?.ecosystemOrgs?.organisation?.name}
                    </p>
                }
            </div>
            {attributesData?.data && attributesData?.data?.length > 0 &&
                <div className="flow-root mt-auto">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        <li className="">
                            <div className="flex items-center space-x-4">
                                <div className="block text-base font-semibold text-gray-900 dark:text-white">
                                    Attributes:
                                </div>
                                <div className="flex flex-wrap items-start overflow-hidden overflow-ellipsis">

                                    {attributesData?.data?.map((element: string | { attributeName: string }) => {
                                        const attribute = typeof element === "string" ? element : element?.attributeName
                                        return (
                                            <div key={`schema-card-attributes${attribute}`}>
                                                <span
                                                    style={{ display: 'block' }}
                                                    className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {attribute}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    {!allAttributes && attributesData.sliced && <span>...</span>}
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            }
        </Card >
    )
}
export default EndorsementCard
