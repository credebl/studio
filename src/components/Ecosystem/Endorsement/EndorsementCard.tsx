import { Card } from 'flowbite-react';
import { dateConversion } from '../../../utils/DateConversion';
import DateTooltip from '../../../components/Tooltip';
import { EndorsementStatus, EndorsementType } from '../../../common/enums';
import StatusTabletTag from '../../../commonComponents/StatusTabletTag';
import { checkEcosystem } from '../../../config/ecosystem';

interface IProps {
    className?: string,
    data: any,
    fromEndorsementList?: boolean,
    cardTransitionDisabled?: boolean
    endorsementType?: EndorsementType
    allAttributes?: boolean
    onClickCallback?: (data: any) => void;
}

interface IAttrubute {
    attributeName: string
}

const EndorsementCard = ({ fromEndorsementList, data, onClickCallback, cardTransitionDisabled, allAttributes }: IProps) => {
    const enableAction = (!fromEndorsementList && data?.status === EndorsementStatus.approved) || Boolean(fromEndorsementList)

    const { isEcosystemLead } = checkEcosystem()


    const requestPayload = data?.requestPayload && JSON.parse(data?.requestPayload)

    const requestData = requestPayload?.operation?.data
    const attributesData = allAttributes ? requestData?.attr_names : requestData?.attr_names?.slice(0, 3)

    return (
        <Card onClick={() => {
            if (enableAction && onClickCallback) {
                onClickCallback(data)
            }
        }}
            className={`${cardTransitionDisabled ? "" : "transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer"}  ${enableAction ? "cursor-pointer" : cardTransitionDisabled ? "cursor-default" : "cursor-not-allowed"} ${cardTransitionDisabled && "shadow-none"} m-3`}
        >      <div className="flex justify-between items-start">
                <div>
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                        {requestData?.name}
                    </h5>
                    <p className='dark:text-white'>
                        Version: {requestData?.version}
                    </p>
                </div>
                <div className='float-right ml-auto'>
                    <p className='dark:text-white'>
                        <DateTooltip date={data?.createDateTime}>
                            Requested: {dateConversion(data?.createDateTime)}
                        </DateTooltip >
                    </p >
                </div >
            </div >
            {
                data?.status &&
                <div className='flex items-center'>
                    <div className='dark:text-white'>
                        Status:
                    </div>
                    <div className='ml-4'>
                        <StatusTabletTag status={data?.status} />
                    </div>
                </div>
            }
            < div className="min-w-0 flex-1" >
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Schema ID:</span> {data?.schemaId}
                </p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Author DID:</span> {data?.authorDid}
                </p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Ledger:</span> NA
                </p>
                {isEcosystemLead &&
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        <span className="font-semibold">Organization:</span> NA
                    </p>
                }
            </div>

            <div className="flow-root">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="py-3 sm:py-2">
                        <div className="flex items-center space-x-4">
                            <div className="block text-base font-semibold text-gray-900 dark:text-white">
                                Attributes:
                            </div>
                            <div className="flex flex-wrap items-start overflow-hidden overflow-ellipsis">

                                {attributesData && attributesData.length > 0 && (
                                    <>
                                        {attributesData.map((element: string, index: number) => (
                                            <div key={`schema-card-attributes${element}`}>
                                                <span
                                                    style={{ display: 'block' }}
                                                    className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {element}
                                                </span>
                                            </div>
                                        ))}
                                        {attributesData.length === 3 && <span>...</span>}
                                    </>
                                )}
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </Card >
    )
}
export default EndorsementCard
