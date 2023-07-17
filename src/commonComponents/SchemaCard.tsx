import { Card } from 'flowbite-react';

const SchemaCard = (props: { schemaName: string, version: string, schemaId: string, issuerDid: string, attributes: string[], created: string },) => {
  return (
    <Card onClick={() => {
      window.location.href = `/organizations/schemas/view-schema?schemaId=${props.schemaId}`
    }} className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer' style={{ width: '485px', height: '240px' }}>
      <div className="flex justify-between items-start">
        <div>
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
            {props.schemaName}
          </h5>
          <p>
            Version: {props.version}
          </p>
        </div>
        <div className='float-right ml-auto '>
          <p>
            {new Date(props.created).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
          <span className="font-semibold">Schema ID:</span> {props.schemaId}
        </p>
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pb-2">
          <span className="font-semibold">Issuer DID:</span> {props.issuerDid}
        </p>
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          <span className="font-semibold">Ledger:</span> {props.issuerDid.split(':')[2]}
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


