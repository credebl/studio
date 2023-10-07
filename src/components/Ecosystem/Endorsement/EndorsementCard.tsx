import { Card } from 'flowbite-react';
import { dateConversion } from '../../../utils/DateConversion';
import DateTooltip from '../../../components/Tooltip';
import { EndorsementStatus, EndorsementType } from '../../../common/enums';
import StatusTabletTag from '../../../commonComponents/StatusTabletTag';
import checkEcosystem from '../../../config/ecosystem';
import type { IAttributes } from '../../Resources/Schema/interfaces';

type IStatus = "Approved" | "Rejected" | "Requested" | "Submitted"
interface IProps {
    className?: string,
    schemaName: string,
    version: string,
    schemaId: string,
    issuerDid: string,
    attributes: IAttributes[],
    created: string,
    status?: IStatus,
    fromEndorsementList?: boolean,
    cardTransitionDisabled?: boolean
    endorsementType?: EndorsementType
    allAttributes?: boolean
    organizationName?: string
    onClickCallback: (schemaId: string, attributes: IAttributes[], issuerDid: string, created: string) => void;
}

interface IAttrubute {
    attributeName: string
}

const EndorsementCard = (props: IProps) => {
    const enableAction = (!Boolean(props.fromEndorsementList) && props.status === EndorsementStatus.approved) || Boolean(props.fromEndorsementList)
    const attributesData = props.allAttributes ? props?.attributes : props?.attributes?.slice(0, 3)

    const { isEcosystemLead } = checkEcosystem()

    return (
        <Card onClick={() => {
            if (enableAction) {
                props.onClickCallback(props.schemaId, props.attributes, props.issuerDid, props.created)
            }
        }}
            className={`${props.cardTransitionDisabled ? "" : "transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer"}  ${enableAction ? "cursor-pointer" : props.cardTransitionDisabled ? "cursor-default" : "cursor-not-allowed"} ${props.cardTransitionDisabled && "shadow-none"}`}

            style={props.cardTransitionDisabled ? { height: '260px', overflow: 'auto', margin: 10 } : { width: '100%', height: '260px', overflow: 'auto' }}
        >      <div className="flex justify-between items-start">
                <div>
                    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                        {props.schemaName}
                    </h5>
                    <p className='dark:text-white'>
                        Version: {props.version}
                    </p>
                </div>
                <div className='float-right ml-auto '>
                    <p className='dark:text-white'>
                        <DateTooltip date={props.created}>
                            Created: {dateConversion(props.created)}
                        </DateTooltip >
                    </p >
                </div >
            </div >
            {
                props.status &&
                <div className='flex items-center'>
                    <div>
                        Status:
                    </div>
                    <div className='ml-4'>
                        <StatusTabletTag status={props.status} />
                    </div>
                </div>
            }
            < div className="min-w-0 flex-1" >
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Schema ID:</span> {props.schemaId}
                </p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
                    <span className="font-semibold">Issuer DID:</span> {props.issuerDid}
                </p>
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    <span className="font-semibold">Ledger:</span> {props.issuerDid.split(":")[2]}
                </p>
            </div>

            {isEcosystemLead &&
                <p>
                    Org. Name: {props.organizationName}
                </p>
            }

            {/* {props.endorsementType === EndorsementType.credDef ? (

                <div>
                    ID: {props.id}
                    <div>

                        Revocable:
                        <div
                            key={''}
                            className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                        >
                            {props.revocable ? 'Yes' : 'No'}
                        </div>
                    </div>
                </div>

            ) : (
                <div>

                </div>
            )} */}

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
                                        {attributesData.map((element: IAttrubute, index: number) => (
                                            <div key={`schema-card-attributes${index}`}>
                                                <span
                                                    style={{ display: 'block' }}
                                                    className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                                                >
                                                    {element?.attributeName}
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
