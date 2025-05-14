'use client'

import { Card, CardContent } from '@/components/ui/card';
import { DataType, Ledgers, Network, PolygonNetworks } from '@/common/enums';
import type { IAttribute, ISchemaCardProps, ISchemaData } from '../type/SchemaCard';
import { limitedAttributesLength, storageKeys } from '@/config/CommonConstant';

import { Button } from '@/components/ui/button';
import CopyDid from '@/config/CopyDid';
import CustomCheckbox from '@/components/CustomCheckbox';
import DataTooltip from '@/components/dataTooltip'
import DateTooltip from '@/components/DateTooltip';
import type { IAttributes } from '../type/SchemaCard';
import React from 'react';
import { dateConversion } from '@/utils/DateConversion';
// import { getFromLocalStorage } from '@/api/Auth';
import { pathRoutes } from '@/config/pathRoutes';
import { useEffect } from 'react';

const SchemaCard = (props: ISchemaCardProps) => {
    

  const isSelected = props.selectedSchemas?.some(
    (selectedSchema) => selectedSchema.schemaId === props.schemaId || selectedSchema.schemaLedgerId === props.schemaId
  );

  const attributes = props.limitedAttributes !== false ? props?.attributes?.slice(0, 3) : props?.attributes

  const AttributesList: React.FC<{ attributes: IAttribute[], limitedAttributes?: boolean }> = ({ attributes, limitedAttributes }) => {
    const isLimited = limitedAttributes !== false && attributes.length > limitedAttributesLength;
    const displayedAttributes = isLimited ? attributes.slice(0, 3) : attributes;

    return (
    <div className="flex justify-between">
    <div className="block text-base font-semibold text-gray-900 dark:text-white overflow-hidden overflow-ellipsis">
      Attributes:
      <div className="flex flex-wrap items-start">
      {displayedAttributes.map((element) => (
              <div key={element.attributeName}>
                <span
                  style={{ display: 'block' }}
                  className="m-1 bg-primary/10 text-primary text-sm font-medium mr-2 px-2.5 py-0.5 rounded"
                >
                  {element?.attributeName}
                </span>
                </div>
          ))}
          {isLimited && <span className="ml-2 text-gray-500 dark:text-gray-300">...</span>}
        </div>
    </div>
    </div>
  );
}

  const handleButtonClick = () => {
    if (props.onClickW3cIssue) {
      props.onClickW3cIssue(props.schemaId, props.schemaName, props.version, props.issuerDid, props.attributes, props.created);
    }
  };

const handleCheckboxChange = (checked: boolean, schemaData?: ISchemaData) => {

  if (props.onChange) {
      if (schemaData) {
          props.onChange(checked, [schemaData]);
      } else {
          props.onChange(checked, []);
      }
  }
};

const SchemaData = {
  schemaId: props.schemaId,
  attributes: props.attributes,
  issuerDid: props.issuerDid,
  created: props.created,
};

 const W3CSchemaData = {
      schemaId: props.schemaId,
      schemaName: props.schemaName,
      version: props.version,
      issuerDid: props.issuerDid,
      attributes: props.attributes,
      created: props.created,
  };

  const hasNestedAttributes = props.attributes?.some((attr:IAttributes) => attr.schemaDataType === DataType.ARRAY);

  return (
    <Card onClick={() => {
      if (!props.w3cSchema && props.onClickCallback) {
        props.onClickCallback(SchemaData);
      }
     if (props.w3cSchema && props.onClickW3CCallback) {
          props.onClickW3CCallback(W3CSchemaData);
        }
    }}
      id="schema-cards"
      className={`relative transform transition duration-500 ${props.w3cSchema ? "" : (props.isClickable !== false) ? "hover:scale-105 hover:bg-gray-50 cursor-pointer" : "hover:!cursor-default"} h-full w-full overflow-hidden ${hasNestedAttributes ? "opacity-80 pointer-events-none" : ""}`}
      >

      {hasNestedAttributes && (
          <div className="absolute inset-0 bg-custom-800/80 pointer-events-none"></div>
        )}

      {hasNestedAttributes && (
            <div className='bg-background/80 absolute inset-0 z-10 flex items-center justify-center'>
          <div className='bg-secondary text-primary rounded-md p-4 text-center text-sm shadow-lg'>
              This schema can only be used through the API as it contains nested objects.
            </div>
          </div>
        )}

      <CardContent className='space-y-4 p-4 sm:p-6'>

            <div className="flex justify-between items-baseline">
              <div className='min-w-[8rem] max-w-100/10rem'>
                <h5 className="text-xl font-bold leading-[1.1] text-gray-900 dark:text-white break-words truncate line-clamp-2 max-h-[43px] whitespace-normal" style={{ display: "-webkit-box" }}>
                  <span className='flex items-center'>
                    <span className="">
                      {props.schemaName}
                    </span>
                  </span>
                </h5>

                <p className='dark:text-white'>
                  Version: {props.version}
                </p>
              </div>
              <div className='float-right ml-auto flex'>
                <div>
                  {props.w3cSchema && (
                    <span
                      style={{ display: 'block' }}
                      className="ml-2 bg-blue-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 mr-2 rounded dark:bg-blue-900 dark:text-blue-300"
                    >
                      W3C
                    </span>
                  )}
                </div>

                <div className='dark:text-white'>
                  <DateTooltip date={props.created}>
                    <div>Created: {dateConversion(props.created)}</div>
                  </DateTooltip>
                </div>
              </div>
            </div>
            <div className='min-w-0 space-y-1 text-sm'>
                <div className='flex items-start sm:items-center'>
                  <strong className='mr-2 shrink-0'>Schema ID:</strong>
                  <div className='min-w-0 truncate'>
                    <CopyDid
                      value={props.schemaId || ''}
                      className='text-foreground truncate font-mono text-sm'
                    />
                  </div>
                </div>

                <div className='flex items-start sm:items-center'>
                  <strong className='mr-2 shrink-0'>Issuer DID:</strong>
                  <div className='min-w-0 truncate'>
                    <CopyDid
                      value={props.issuerDid || ''}
                      className='text-foreground truncate font-mono text-sm'
                    />
                  </div>
                </div>

                {!props.noLedger && (
                  <div className='flex items-center'>
                    <strong className='mr-2 shrink-0'>Ledger:</strong>
                    <span className='text-foreground truncate text-sm'>
                      {props.issuerDid?.includes(Ledgers.POLYGON)
                        ? props.issuerDid?.includes(Network.TESTNET)
                          ? PolygonNetworks.TESTNET
                          : PolygonNetworks.MAINNET
                        : props?.issuerDid?.split(':')[2]}
                    </span>
                  </div>
                )}
              </div>

            <div className="flex justify-between">
              {props.w3cSchema ? (
                <DataTooltip
                  data={props.attributes}
                  renderItem={(attribute: IAttribute) => attribute.attributeName}
                >
                              <AttributesList attributes={props.attributes} limitedAttributes={props.limitedAttributes} />

                </DataTooltip>
              ) : (
                
                <AttributesList attributes={props.attributes} limitedAttributes={props.limitedAttributes} />

              )}
              <div className='mt-4'>
                {props.w3cSchema && !props.isVerification && !props.isVerificationUsingEmail && (
                <div className="p-2">
                  <Button
                    onClick={() => {
                      handleButtonClick();
                      window.location.href = pathRoutes.organizations.Issuance.issue;
                    }}
                    type="submit"
                    color='bg-primary-800'
                    title='Initiate Credential Issuance'
                    className='bg-secondary-700 ring-primary-700 bg-white-700 hover:bg-secondary-700 
                    ring-2 text-black font-medium rounded-lg text-sm mr-2 ml-auto dark:text-white dark:hover:text-black 
                    dark:hover:bg-primary-50'
                    style={{ height: '1.5rem', width: '100%', minWidth: '2rem' }}
                  >
                    <div className='mr-2'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 23 23">  <path fill="#1F4EAD" fillRule="evenodd" d="M21 21H2V2h9.5V0H2.556A2.563 2.563 0 0 0 0 2.556v17.888A2.563 2.563 0 0 0 2.556 23h17.888A2.563 2.563 0 0 0 23 20.444V11.5h-2V21ZM14.056 0v2H19.5l-13 13 1 1.5L21 3v5.944h2V0h-8.944Z" clipRule="evenodd" />
                    </svg>
                  </div>
                    Issue
                  </Button>
                </div>
                )}
                </div>
            </div>

            {props.showCheckbox && !hasNestedAttributes && (
              <CustomCheckbox
                isSelectedSchema={isSelected}
                onChange={handleCheckboxChange}
                showCheckbox={props.showCheckbox}
                schemaData={{ schemaId: props.schemaId, schemaName: props.schemaName, attributes: props.attributes }}
              />
            )}
      </CardContent>
    </Card>
  )
}
export default SchemaCard