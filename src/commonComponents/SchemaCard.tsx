import { Card } from 'flowbite-react';
import { dateConversion } from '../utils/DateConversion';

const SchemaCard = (props: { schemaName: string, version: string, schemaId: string, issuerDid: string, attributes: string[], created: string,ledger:string,ledgerShow:boolean, onClickCallback: (schemaId: string) => void; },) => {
  return (
    <Card onClick={() => {
      window.location.href = `${pathRoutes.organizations.viewSchema}?schemaId=${props.schemaId}`
    }} className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer' style={{ maxWidth: '100%', maxHeight: '100%', overflow: 'auto' }}>
      <div className="flex justify-between items-start">
        <div>
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
            {props.schemaName}
          </h5>
          <p className='dark:text-white'>
            Version: {props.version}
          </p>
        </div>
        {/* <div className='float-right ml-auto '>
          <p className='dark:text-white'>
            Created no: {new Date(props.created).toLocaleDateString('en-GB')}
          </p>
        </div> */}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
          <span className="font-semibold">Schema ID:</span> {props.schemaId}
        </p>
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
          <span className="font-semibold">Issuer DID:</span> {props.issuerDid}
        </p>
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
					{
					props.ledgerShow?
         <> <span className="font-semibold">Ledger:</span> {props.ledger}</>:
         <> <span className="font-semibold">Ledger:</span> {props.issuerDid.split(":")[2]}</>

				 
					}
        </p>
      </div>

      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-3 sm:py-2">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white overflow-hidden overflow-ellipsis">
                Attributes:
                {props.attributes && props.attributes.length > 0 && (
                  <>
                    {props.attributes.slice(0, 4).map((element, index) => (
                      <span
                        key={index}
                        className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                      >
                        {element}
                      </span>
                    ))}
                    {props.attributes.length > 4 && <span>...</span>}
                  </>
                )}
              </div>
            </div>

          </li>

        </ul>
      </div>

    </Card>
  )
}


export default SchemaCard
