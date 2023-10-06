import { Button, Card, Modal } from 'flowbite-react';
import React from 'react';
import { pathRoutes } from '../../config/pathRoutes';
import { EcosystemRoles, RequestedType } from '../../common/enums';
import SchemaCard from '../../commonComponents/SchemaCard';
import DateTooltip from '../Tooltip';
import { dateConversion } from '../../utils/DateConversion';
import { date } from 'yup';
import checkEcosystem from './EcosystemRoles';

const EndorsementPopup = (props: {
  openModal: boolean;
  closeModal: () => void;
  onAccept: (flag: boolean) => void;
  onReject: (flag: boolean) => void;
  name: string;
  id: string;
  version: string;
  authorDID: string;
  revocable: boolean;
  endorsementType: RequestedType;
  organizationName: string;
  tag: string;
  ecosystemRole: EcosystemRoles;
  ledger: string;
  attrNames: [];
  created: string;
}) => {
  const schemaCallback = (schemaId: string) => {
    window.location.href = `${pathRoutes.ecosystems.schema}`;
  };
  const credDefCallback = (schemaId: string, credentialDefinitionId: string) => {
    window.location.href = `${pathRoutes.ecosystems.credDef}`;
  };


  return (
    <Modal show={props.openModal} onClose={props.closeModal}  size="lg">
      <Modal.Header>
        {props.ecosystemRole === EcosystemRoles.lead ? (
          <div>
            Requested {props.endorsementType}
          </div>
        ) : (
          <div>
            View {props.endorsementType}
          </div>
        )}

      </Modal.Header>

      {/* {props.endorsementType=== RequestedType.schema} */}
      <SchemaCard className='flex justify-center'
                  schemaName= {props.name}
                  version= {props.version}
                  schemaId= {props.id}
                  issuerDid= {props.authorDID}
                  attributes={props.attrNames}
                  created= {props.created}
                  isLarge= {true}
                  >

              {props.ecosystemRole=== EcosystemRoles.lead && 
                <p>
                  Org. Name: {props.organizationName}
                </p>
                }


          {props.endorsementType=== RequestedType.credDef ? (

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
          ) }

      </SchemaCard>

        {/* <Card className='flex justify-center max-w-full mr-4 ml-4 mt-4 mb-4 width: 560px height: 359px'>

          <div className='width: 512px height: 254px flex-shrink: 0;' >
            {props.name && 
              <p className='text-xl font-bold leading-none text-gray-900 dark:text-white p-1 pb-2'>
                {props.name}
              </p>
              }
            {props.version &&
              <p className='p-1 dark:text-white break-words'>
                Version: {props.version}
              </p>            
            }


            {props.tag && 
              <p>
                ID: {props.tag}
              </p>
              }

              <p className='p-1 dark:text-white break-all'>
                Schema ID: {props.id}
              </p> 

            {props.authorDID &&
              <p className='p-1 dark:text-white break-all'>
                Author DID: {props.authorDID}
              </p> 
            }
            <p className= 'p-1 dark:text-white break-all'>
              Ledger: {props.ledger}
            </p>
            
            {props.ecosystemRole=== EcosystemRoles.lead && 
                <p>
                  Org. Name: {props.organizationName}
                </p>
                }

            {props.attrNames && 
              <p className="font-medium mt-2">
              Attributes:
              {props.attrNames &&
              props.attrNames.length > 0 &&
              props.attrNames.map((element: string) => (
                <span
                  key={element}
                  className='m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300'
                >
                  {element}
                </span>
              ))}
              </p>       
            }

            {props.endorsementType===RequestedType.credDef && 
            <div>
              Revocable: 
              <div
               key={''}
               className="m-1 bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
             >
               {props.revocable ? 'Yes' : 'No'}
            </div> 
            </div>
              }
              </div>
            </Card> */}

              <div className='justify-between'>
                <div className='flex justify-end'>
              {props.endorsementType === RequestedType.schema ? (
                <div className='flex gap-2 py-2'>

            <Button onClick={() => props.onReject(true)} 
                    class="hover:bg-secondary-700 bg-transparent ring-2 text-black font-medium rounded-lg text-sm  "
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20.4848 3.51515C18.2172 1.24747 15.2071 0 12 0C8.79293 0 5.78283 1.24747 3.51515 3.51515C1.24747 5.78283 0 8.79293 0 12C0 15.2071 1.24747 18.2172 3.51515 20.4848C5.78283 22.7525 8.79293 24 12 24C15.2071 24 18.2172 22.7525 20.4848 20.4848C22.7525 18.2172 24 15.2071 24 12C24 8.79293 22.7525 5.78283 20.4848 3.51515ZM19.5202 19.5202C17.5101 21.5303 14.8384 22.6364 12 22.6364C9.16162 22.6364 6.4899 21.5303 4.4798 19.5202C0.333333 15.3737 0.333333 8.62626 4.4798 4.4798C6.4899 2.4697 9.16162 1.36364 12 1.36364C14.8384 1.36364 17.5101 2.4697 19.5202 4.4798C23.6667 8.62626 23.6667 15.3737 19.5202 19.5202Z" fill="#1F4EAD"/>
                    <path d="M17.2882 6.71248C17.0206 6.4448 16.5913 6.4448 16.3236 6.71248L12.0004 11.0357L7.67712 6.71248C7.40945 6.4448 6.98015 6.4448 6.71248 6.71248C6.4448 6.98015 6.4448 7.40945 6.71248 7.67712L11.0357 12.0004L6.71248 16.3236C6.4448 16.5913 6.4448 17.0206 6.71248 17.2882C6.84379 17.4195 7.02056 17.4903 7.19227 17.4903C7.36399 17.4903 7.54076 17.4246 7.67207 17.2882L11.9953 12.965L16.3185 17.2882C16.4499 17.4195 16.6266 17.4903 16.7983 17.4903C16.9751 17.4903 17.1468 17.4246 17.2781 17.2882C17.5458 17.0206 17.5458 16.5913 17.2781 16.3236L12.965 12.0004L17.2882 7.67712C17.5559 7.40945 17.5559 6.98015 17.2882 6.71248Z" fill="#1F4EAD"/>
                    </svg>

                    {/* display: flex padding: 12px align-items: flex-start gap: 12px border-radius: 8px border: 1px solid #1F4EAD; */}
                    <span className='text- blue-700 ml-2 '>                
                      Reject
                    </span>
            </Button>

            <Button onClick={() => props.onAccept(true)}
                    class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 mr-3"
                    >
                    <svg className="h-8 w-8 text-white"  
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className='text- blue-700 ml-2 '>                
                      Accept
                    </span>            
                  </Button>

                </div>
              ) : (
                <div>
                  <Button onClick={() => props.onAccept(true)}>
                Signed
            </Button>
            <Button onClick={() => props.onAccept(false)} onClose={props.closeModal}>
                Reject
            </Button>
                </div>
              ) }
              </div>
            </div>
    </Modal>
  );
};

export default EndorsementPopup;