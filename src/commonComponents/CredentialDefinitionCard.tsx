import { Button, Card } from 'flowbite-react';

import { Roles } from '../utils/enums/roles';

interface IProps {
  credDeffName: string,
  userRoles?: string[],
  credentialDefinitionId: string
  schemaId: string
  revocable: boolean
  onClickCallback: (schemaId: string, credentialDefinitionId: string) => void;
}

const CredDeffCard = (props: IProps) => {

  const redirectToIssuance = () => {
    if (props?.userRoles?.includes(Roles.OWNER)
      || props?.userRoles?.includes(Roles.ADMIN)
      || props?.userRoles?.includes(Roles.ISSUER)) {
      props.onClickCallback(props.schemaId, props.credentialDefinitionId)

    }
  }

  return (
    <Card onClick={redirectToIssuance} className='cursor-pointer overflow-hidden overflow-ellipsis h-full' style={{ maxHeight: '100%', maxWidth: '100%', overflow: 'auto' }}>
      <div className="mb-1 flex items-center justify-between flex-wrap">
        <div className="min-w-[6rem] max-w-100/8rem"> {/* This will take up 2/3 of the available width on larger screens */}
          <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white break-words truncate line-clamp-2 max-h-[40px] whitespace-normal" style={{ display: "-webkit-box" }}>
            {props.credDeffName}
          </h5>
        </div>
        {
          props.userRoles
          && (props.userRoles.includes(Roles.OWNER)
            || props.userRoles.includes(Roles.ADMIN)
            || props.userRoles.includes(Roles.ISSUER)
          )
          && <div className="p-2">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 23 23">  <path fill="#1F4EAD" fill-rule="evenodd" d="M21 21H2V2h9.5V0H2.556A2.563 2.563 0 0 0 0 2.556v17.888A2.563 2.563 0 0 0 2.556 23h17.888A2.563 2.563 0 0 0 23 20.444V11.5h-2V21ZM14.056 0v2H19.5l-13 13 1 1.5L21 3v5.944h2V0h-8.944Z" clip-rule="evenodd" />
                </svg>
              </div>

              Issue
            </Button>
          </div>
        }

      </div>
      <div className="min-w-0 flex-1 flex flex-col">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          ID : {props.credentialDefinitionId}
        </p>
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white pt-2 pb-1">
          Schema ID:{props.schemaId}
        </p>
        <div className="mt-auto inline-flex items-center text-base font-semibold text-gray-900 dark:text-white overflow-hidden overflow-ellipsis">
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
