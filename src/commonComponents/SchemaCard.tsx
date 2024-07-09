import { Button, Card } from 'flowbite-react';
import { dateConversion } from '../utils/DateConversion';
import DateTooltip from '../components/Tooltip';
import CopyDid from './CopyDid';
import React from 'react';

interface IProps {
  className?: string,
  schemaName: string,
  version: string,
  schemaId: string,
  issuerDid: string,
  attributes: [],
  created: string,
  isClickable?: boolean
  onClickCallback: (schemaId: string, attributes: string[], issuerDid: string, created: string) => void;
  limitedAttributes?: boolean
  w3cSchema:boolean
  noLedger:boolean
}
const SchemaCard = (props: IProps) => {

  const attributes = props.limitedAttributes !== false ? props?.attributes?.slice(0, 3) : props?.attributes
  return (
    <Card  onClick={() => {
      if (!props.w3cSchema) {
        props.onClickCallback(props.schemaId, props.attributes, props.issuerDid, props.created)
      }
    }}
      id="schema-cards"
      className={`transform transition duration-500 ${(props.isClickable !== false && !props.w3cSchema) ? "hover:scale-105 hover:bg-gray-50 cursor-pointer" : "hover:!cursor-default"} h-full w-full overflow-hidden`}>
      <div className="flex justify-between items-baseline">
        <div className='min-w-[8rem] max-w-100/10rem'>
        <h5 className="text-xl font-bold leading-[1.1] text-gray-900 dark:text-white break-words truncate line-clamp-2 max-h-[43px] whitespace-normal" style={{ display: "-webkit-box" }}>
            <span className='flex items-center'>
              <span className="">
                {props.schemaName}
              </span>
              {props.w3cSchema && (
                <span
                  style={{ display: 'block' }}
                  className="ml-2 bg-blue-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                >
                  W3C
                </span>
              )}
            </span>
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
        {!props.noLedger &&
         <p className="truncate dark:text-white break-all flex">
         <span className="font-semibold mr-2">Ledger:</span> {props?.issuerDid?.split(":")[2]}
       </p>
        }
      </div>

      <div className="flex justify-between">
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
        {props.w3cSchema && (
          <div className="p-2">
            <Button
              type="submit"
              color='bg-primary-800'
              title='Initiate Credential Issuance'
              className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 
              ring-2 text-black font-medium rounded-lg text-sm mr-2 ml-auto dark:text-white dark:hover:text-black 
              dark:hover:bg-primary-50'
              style={{ height: '1.5rem', width: '100%', minWidth: '2rem' }}
            >
              <div className='mr-2'>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 23 23">
                  <path fill="#1F4EAD" fill-rule="evenodd" d="M21 21H2V2h9.5V0H2.556A2.563 2.563 0 0 0 0 2.556v17.888A2.563 2.563 0 0 0 2.556 23h17.888A2.563 2.563 0 0 0 23 20.444V11.5h-2V21ZM14.056 0v2H19.5l-13 13 1 1.5L21 3v5.944h2V0h-8.944Z" clip-rule="evenodd" />
                </svg>
              </div>
              Issue
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
export default SchemaCard