import { Button, Card } from 'flowbite-react';

const CredDeffCard = (props: { credDeffName: string, credentialDefinitionId: string, schemaId: string, revocable: boolean, onClickCallback: (schemaId: string, credentialDefinitionId: string) => void; }) => {
  return (
    <Card onClick={() => {
      props.onClickCallback(props.schemaId, props.credentialDefinitionId)
    }} className=' cursor-pointer overflow-hidden overflow-ellipsis' style={{ maxHeight: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <div className="mb-1 lg:flex lg:items-center justify-between">
        <div className="lg:w-1/2 md:w-2/3"> {/* This will take up 2/3 of the available width on larger screens */}
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
            {props.credDeffName}
          </h5>
        </div>
        <div className="p-2 lg:w-1/2 md:w-2/3 mt-2 lg:mt-0">
          <Button
            type="submit"
            color='bg-primary-800'
            title='Initiate Credential Issuance'
            className='transform transition duration-500 hover:scale-105 hover:bg-gray-50 dark:text-white bg-primary-700 bg-transparent ring-primary-700 ring-2 text-black font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5'
            style={{ height: '1.5rem', width: '100%', minWidth: '2rem' }}
          >
            <div className='mr-2'>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 23 23">  <path fill="#030300" fill-rule="evenodd" d="M21 21H2V2h9.5V0H2.556A2.563 2.563 0 0 0 0 2.556v17.888A2.563 2.563 0 0 0 2.556 23h17.888A2.563 2.563 0 0 0 23 20.444V11.5h-2V21ZM14.056 0v2H19.5l-13 13 1 1.5L21 3v5.944h2V0h-8.944Z" clip-rule="evenodd" />
            </svg>
            </div>

            Issue
          </Button>
        </div>
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
