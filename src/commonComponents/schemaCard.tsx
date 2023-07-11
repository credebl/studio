import { Card } from 'flowbite-react';
import { useState } from 'react';



const SchemaCard = (props: { schemaName: string, version: string, schemaId: string, issuerDid: string, attributes: any }) => {
  const [showAllAttributes, setShowAllAttributes] = useState(false);

  const handleToggleAttributes = () => {
    setShowAllAttributes(!showAllAttributes);
  };
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
            {props.schemaName}
          </h5>
          <p>
            Version: {props.version}
          </p>
        </div>
        <a
          className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500"
          href="#"
        >
          <p>
            View
          </p>
        </a>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          Schema ID:{props.schemaId}
        </p>
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
          Issuer DID:{props.issuerDid}
        </p>
      </div>
      {/* <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-3 sm:py-4">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                Attributes:
                {props.attributes && props.attributes.length > 0 &&

                  props.attributes.map((element: string) => (

                    <span className='m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'> {element}</span>
                  ))}
              </div>

              <a
            className="text-sm font-medium text-cyan-600 hover:underline dark:text-cyan-500"
            href="#"
          >
            <p>
              more...
            </p>
          </a>
            </div>
          </li>
         
        </ul>
      </div> */}
      <div className={`flow-root ${showAllAttributes ? 'h-auto' : 'h-14'}`}>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          <li className="py-3 sm:py-4 overflow-auto">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                Attributes:
                {props.attributes &&
                  props.attributes.length > 0 &&
                  props.attributes.map((element: string, index: number) => {
                    if (!showAllAttributes && index >= 4) {
                      return null;
                    }
                    return (
                      <span
                        key={index}
                        className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                      >
                        {element}
                      </span>
                    );
                  })}
                {props.attributes && props.attributes.length > 4 && (
                  <a
                    className={`text-sm font-medium ${showAllAttributes ? 'text-blue-600' : 'text-cyan-600'} hover:underline dark:text-cyan-500 cursor-pointer overflow-auto`}
                    onClick={handleToggleAttributes}
                  >
                    <p>{showAllAttributes ? 'less...' : 'more...'}</p>
                  </a>
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


