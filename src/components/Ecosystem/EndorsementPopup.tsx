import { Button, Modal } from 'flowbite-react';
import { EcosystemRoles, EndorsementType } from '../../../common/enums';
import checkEcosystem from '../../../config/ecosystem';
import EndorsementCard from './EndorsementCard';
import type { IAttributes } from '../../Resources/Schema/interfaces';

const EndorsementPopup = (props: {
  openModal: boolean;
  closeModal: () => void;
  isAccepted: (flag: boolean) => void;
  name: string;
  id: string;
  version: string;
  authorDID: string;
  revocable: boolean;
  endorsementType: EndorsementType;
  organizationName: string;
  ecosystemRole: EcosystemRoles;
  attrNames: [];
  created: string;
}) => {

  const { isEcosystemLead } = checkEcosystem()

  return (
    <Modal show={props.openModal} onClose={props.closeModal} size="xl">
      <Modal.Header>
        {isEcosystemLead ? (
          <div>
            Requested {props.endorsementType}
          </div>
        ) : (
          <div>
            View {props.endorsementType}
          </div>
        )}

      </Modal.Header>

      <EndorsementCard className='flex justify-center'
        schemaName={props.name}
        version={props.version}
        schemaId={props.id}
        issuerDid={props.authorDID}
        attributes={props.attrNames}
        created={props.created}
        cardTransitionDisabled={true} 
        onClickCallback={function (schemaId: string, attributes: IAttributes[], issuerDid: string, created: string): void {
          throw new Error('Function not implemented.');
        }}
        allAttributes={true}
        endorsementType={EndorsementType.schema}
        organizationName="Ecofriendly Boxes"
      />

      <div className='justify-between'>
        <div className='flex justify-end'>
          {props.endorsementType === EndorsementType.schema ? (
            <div className='flex gap-2 py-2'>

              <Button onClick={() => props.isAccepted(false)}
                class="hover:bg-secondary-700 bg-transparent ring-2 text-black font-medium rounded-lg text-sm  "
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20.4848 3.51515C18.2172 1.24747 15.2071 0 12 0C8.79293 0 5.78283 1.24747 3.51515 3.51515C1.24747 5.78283 0 8.79293 0 12C0 15.2071 1.24747 18.2172 3.51515 20.4848C5.78283 22.7525 8.79293 24 12 24C15.2071 24 18.2172 22.7525 20.4848 20.4848C22.7525 18.2172 24 15.2071 24 12C24 8.79293 22.7525 5.78283 20.4848 3.51515ZM19.5202 19.5202C17.5101 21.5303 14.8384 22.6364 12 22.6364C9.16162 22.6364 6.4899 21.5303 4.4798 19.5202C0.333333 15.3737 0.333333 8.62626 4.4798 4.4798C6.4899 2.4697 9.16162 1.36364 12 1.36364C14.8384 1.36364 17.5101 2.4697 19.5202 4.4798C23.6667 8.62626 23.6667 15.3737 19.5202 19.5202Z" fill="#1F4EAD" />
                  <path d="M17.2882 6.71248C17.0206 6.4448 16.5913 6.4448 16.3236 6.71248L12.0004 11.0357L7.67712 6.71248C7.40945 6.4448 6.98015 6.4448 6.71248 6.71248C6.4448 6.98015 6.4448 7.40945 6.71248 7.67712L11.0357 12.0004L6.71248 16.3236C6.4448 16.5913 6.4448 17.0206 6.71248 17.2882C6.84379 17.4195 7.02056 17.4903 7.19227 17.4903C7.36399 17.4903 7.54076 17.4246 7.67207 17.2882L11.9953 12.965L16.3185 17.2882C16.4499 17.4195 16.6266 17.4903 16.7983 17.4903C16.9751 17.4903 17.1468 17.4246 17.2781 17.2882C17.5458 17.0206 17.5458 16.5913 17.2781 16.3236L12.965 12.0004L17.2882 7.67712C17.5559 7.40945 17.5559 6.98015 17.2882 6.71248Z" fill="#1F4EAD" />
                </svg>

                <span className='text- blue-700 ml-2 mr-2'>
                  Reject
                </span>
              </Button>

              <Button onClick={() => props.isAccepted(true)}
                class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 mr-3"
              >
                <svg className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className='text- blue-700 ml-2 '>
                  Accept
                </span>
              </Button>

            </div>
          ) : (
            <div>
              <Button onClick={() => props.isAccepted(false)}
                class="hover:bg-secondary-700 bg-transparent ring-2 text-black font-medium rounded-lg text-sm  "
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20.4848 3.51515C18.2172 1.24747 15.2071 0 12 0C8.79293 0 5.78283 1.24747 3.51515 3.51515C1.24747 5.78283 0 8.79293 0 12C0 15.2071 1.24747 18.2172 3.51515 20.4848C5.78283 22.7525 8.79293 24 12 24C15.2071 24 18.2172 22.7525 20.4848 20.4848C22.7525 18.2172 24 15.2071 24 12C24 8.79293 22.7525 5.78283 20.4848 3.51515ZM19.5202 19.5202C17.5101 21.5303 14.8384 22.6364 12 22.6364C9.16162 22.6364 6.4899 21.5303 4.4798 19.5202C0.333333 15.3737 0.333333 8.62626 4.4798 4.4798C6.4899 2.4697 9.16162 1.36364 12 1.36364C14.8384 1.36364 17.5101 2.4697 19.5202 4.4798C23.6667 8.62626 23.6667 15.3737 19.5202 19.5202Z" fill="#1F4EAD" />
                  <path d="M17.2882 6.71248C17.0206 6.4448 16.5913 6.4448 16.3236 6.71248L12.0004 11.0357L7.67712 6.71248C7.40945 6.4448 6.98015 6.4448 6.71248 6.71248C6.4448 6.98015 6.4448 7.40945 6.71248 7.67712L11.0357 12.0004L6.71248 16.3236C6.4448 16.5913 6.4448 17.0206 6.71248 17.2882C6.84379 17.4195 7.02056 17.4903 7.19227 17.4903C7.36399 17.4903 7.54076 17.4246 7.67207 17.2882L11.9953 12.965L16.3185 17.2882C16.4499 17.4195 16.6266 17.4903 16.7983 17.4903C16.9751 17.4903 17.1468 17.4246 17.2781 17.2882C17.5458 17.0206 17.5458 16.5913 17.2781 16.3236L12.965 12.0004L17.2882 7.67712C17.5559 7.40945 17.5559 6.98015 17.2882 6.71248Z" fill="#1F4EAD" />
                </svg>

                <span className='text- blue-700 ml-2 mr-2'>
                  Reject
                </span>
              </Button>
              <Button onClick={() => props.isAccepted(true)}
                class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 mr-3"
              >
                <svg className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className='text- blue-700 ml-2 '>
                  Signed
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EndorsementPopup;