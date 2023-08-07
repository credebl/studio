import { Card } from 'flowbite-react';

const CredDeffCard = (props: { credDeffName: string, credentialDefinitionId: string, schemaId: string, revocable: boolean }) => {
  return (
    <Card onClick={() => {
    }} className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 cursor-pointer overflow-hidden overflow-ellipsis' style={{maxHeight: '100%', maxWidth: '100%' ,overflow: 'auto'}}>
      <div className="mb-1 flex items-center justify-between">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {props.credDeffName}
        </h5>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          ID : {props.credentialDefinitionId}
        </p>
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pt-2 pb-1">
          Schema ID:{props.schemaId}
        </p>
        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white overflow-hidden overflow-ellipsis">
          Revocable:
          <>
            <span
              key={''}
              className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
            >
              {props.revocable ? 'Yes' : 'No'}
            </span>

          </>

        </div>

      </div>


    </Card>
  )
}


export default CredDeffCard


