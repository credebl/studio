import { Card } from 'flowbite-react';
import { dateConversion } from '../utils/DateConversion';
import DateTooltip from '../components/Tooltip';
import CopyDid from './CopyDid';

interface IProps {
  className?: string,
  schemaName: string,
  version: string,
  schemaId: string,
  issuerDid: string,
  attributes: [],
  created: string,
  isClickable?: boolean,
  disabled?: boolean,
  onClickCallback: (schemaId: string, attributes: string[], issuerDid: string, created: string) => void;
  limitedAttributes?: boolean
}
const SchemaCard = (props: IProps) => {

  const attributes = props.limitedAttributes !== false ? props?.attributes?.slice(0, 3) : props?.attributes

  return (
    <Card onClick={() => {
      props.onClickCallback(props.schemaId, props.attributes, props.issuerDid, props.created)
    }}
      id="schema-cards"
      className={`transform transition duration-500 ${props.isClickable !== false ? "hover:scale-105 hover:bg-gray-50 cursor-pointer" : "hover:!cursor-default"} h-full w-full overflow-hidden`}>
      <div className="flex justify-between items-baseline">
        <div className='min-w-[8rem] max-w-100/10rem'>
          <h5 className="text-xl font-bold leading-[1.1] text-gray-900 dark:text-white break-words truncate line-clamp-2 max-h-[43px] whitespace-normal" style={{ display: "-webkit-box" }}>
            {props.schemaName}
          </h5>
          <p className='dark:text-white'>
            Version: {props.version}
          </p>
        </div>
        <div className='float-right ml-auto '>
          <div className='dark:text-white'>
            <DateTooltip date={props.created}>
              Created: {dateConversion(props.created)}
            </DateTooltip>          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate dark:text-white break-all flex">
          <span className="font-semibold mr-2">Schema ID: </span>
          <span className='flex w-schema-id'>
            <CopyDid value={props?.schemaId || ""} className='truncate font-courier mt-[2px]' />
          </span>
        </p>
        <p className="truncate dark:text-white break-all flex">
          <span className="font-semibold mr-2">Issuer DID: </span>
          <span className='flex w-issuer-id'>
           <CopyDid value={props.issuerDid || ""} className='truncate font-courier mt-[2px]' />
          </span>
        </p>
        <p className="truncate dark:text-white break-all flex">
          <span className="font-semibold mr-2">Ledger:</span> {props?.issuerDid?.split(":")[2]}
        </p>
      </div>

      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="">
            <div className="flex items-center space-x-4">
              <div className="block text-base font-semibold text-gray-900 dark:text-white overflow-hidden overflow-ellipsis">
                Attributes:
                <div className="flex flex-wrap items-start">

                  {attributes && attributes.length > 0 && (
                    <>
                      {attributes?.map((element) => (
                        <div key={element.attributeName}>
                          <span
                            style={{ display: 'block' }}
                            className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                          >
                            {element?.attributeName}
                          </span>
                        </div>
                      ))}
                      {props?.limitedAttributes !== false && props?.attributes?.length > 3 && <span>...</span>}
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </Card>
  )
}
export default SchemaCard