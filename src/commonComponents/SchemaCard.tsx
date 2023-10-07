import { Card } from 'flowbite-react';
import { dateConversion } from '../utils/DateConversion';
import DateTooltip from '../components/Tooltip';
import { EndorsementStatus } from '../common/enums';
import StatusTabletTag from './StatusTabletTag';

type IStatus = "Approved" | "Rejected" | "Requested" | "Submitted"
interface IProps {
  className?: string,
  schemaName: string,
  version: string,
  schemaId: string,
  issuerDid: string,
  attributes: [],
  created: string,
  status?: IStatus,
  fromEndorsementList?: boolean,
  onClickCallback: (schemaId: string, attributes: string[], issuerDid: string, created: string) => void;
}

interface IAttrubute {
  attributeName: string
}

const SchemaCard = (props: IProps) => {
  const enableAction = props.status === EndorsementStatus.approved

  return (
    <Card onClick={() => {
      if (enableAction) {
        props.onClickCallback(props.schemaId, props.attributes, props.issuerDid, props.created)
      }
    }}
      className={`transform transition duration-500 hover:scale-105 hover:bg-gray-50 h-full ${enableAction ? "cursor-pointer" : "cursor-not-allowed"}`}
    >
      <div className="flex justify-between items-start">
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

      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-3 sm:py-2">
            <div className="flex items-center space-x-4">
              <div className="block text-base font-semibold text-gray-900 dark:text-white">
                Attributes:
              </div>
              <div className="flex flex-wrap items-start overflow-hidden overflow-ellipsis">

                {props.attributes && props.attributes.length > 0 && (
                  <>
                    {props.attributes.map((element: IAttrubute, index: number) => (
                      <div key={`schema-card-attributes${element.attributeName}`}>
                        <span
                          style={{ display: 'block' }}
                          className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                        >
                          {element?.attributeName}
                        </span>
                      </div>
                    ))}
                    {props.attributes.length > 3 && <span>...</span>}
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


export default SchemaCard
