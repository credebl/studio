'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import {
  IAttributes,
  ISchemaCardProps,
  ISchemaData
} from '../type/schemas-interface';
import { DataType, Ledgers, Network, PolygonNetworks } from '@/common/enums';
import { limitedAttributesLength } from '@/config/CommonConstant';
import { pathRoutes } from '@/config/pathRoutes';
import CopyDid from '@/config/CopyDid';
import DataTooltip from '@/components/dataTooltip';
import DateTooltip from '@/components/DateTooltip';
import { dateConversion } from '@/utils/DateConversion';
import CustomCheckbox from '@/components/CustomCheckbox';

const SchemaCard = (props: ISchemaCardProps) => {

  const isSelected = props.selectedSchemas?.some(
    (selectedSchema) =>
      selectedSchema.schemaId === props.schemaId ||
      selectedSchema.schemaLedgerId === props.schemaId
  );

  const AttributesList: React.FC<{
    attributes: IAttributes[];
    limitedAttributes?: boolean;
  }> = ({ attributes, limitedAttributes }) => {
    const isLimited =
      limitedAttributes !== false &&
      attributes.length > limitedAttributesLength;
    const displayedAttributes = isLimited ? attributes.slice(0, 3) : attributes;

    return (
      <div className='text-foreground text-base font-semibold'>
        Attributes:
        <div className='mt-1 flex flex-wrap'>
          {displayedAttributes.map((element) => (
            <span
              key={element.attributeName}
              className='bg-primary/10 text-primary m-1 rounded px-2 py-0.5 text-sm font-medium'
            >
              {element.attributeName}
            </span>
          ))}
          {isLimited && <span className='text-muted-foreground ml-2'>...</span>}
        </div>
      </div>
    );
  };

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
    created: props.created
  };

  const W3CSchemaData = {
    schemaId: props.schemaId,
    schemaName: props.schemaName,
    version: props.version,
    issuerDid: props.issuerDid,
    attributes: props.attributes,
    created: props.created
  };

  const hasNestedAttributes = props.attributes?.some(
    (attr: IAttributes) => attr.schemaDataType === DataType.ARRAY
  );
 
  
  return (
    <Card
      className={`relative h-full w-full transition-transform duration-300 ${
        props.w3cSchema || props.isClickable === false
          ? 'cursor-default'
          : 'hover:bg-muted/20 cursor-pointer hover:scale-[1.02]'
      } ${hasNestedAttributes ? 'pointer-events-none opacity-80' : ''}`}
      onClick={() => {
        if (!props.w3cSchema && props.onClickCallback) {
          props.onClickCallback(SchemaData);
        }
        if (props.w3cSchema && props.onClickW3CCallback) {
          props.onClickW3CCallback(W3CSchemaData);
        }
      }}
    >
      {hasNestedAttributes && (
        <div className='bg-background/80 absolute inset-0 z-10 flex items-center justify-center'>
          <div className='bg-secondary text-primary rounded-md p-4 text-center shadow-lg'>
            This schema can only be used through the API as it contains nested
            objects.
          </div>
        </div>
      )}

      <CardContent className='space-y-4'>
        <div className='flex items-start justify-between'>
          <div className='max-w-[10rem] min-w-[8rem]'>
            <h3 className='text-foreground line-clamp-2 text-xl font-bold break-words'>
              {props.schemaName}
            </h3>
            <p className='text-muted-foreground text-sm'>
              Version: {props.version}
            </p>
          </div>

          <div className='flex items-start gap-2'>
            {props.w3cSchema && (
              <span className='bg-primary/10 text-primary rounded px-2 py-0.5 text-xs font-medium'>
                W3C
              </span>
            )}
            <DateTooltip date={props.created}>
              <span className='text-muted-foreground text-sm'>
                Created: {dateConversion(props.created)}
              </span>
            </DateTooltip>
          </div>
        </div>

        <div className='text-foreground space-y-1 text-sm'>
          <div className='flex break-all'>
            <strong className='mr-2'>Schema ID:</strong>
            <CopyDid
              value={props.schemaId || ''}
              className='truncate font-mono'
            />
          </div>
          <div className='flex break-all'>
            <strong className='mr-2'>Issuer DID:</strong>
            <CopyDid
              value={props.issuerDid || ''}
              className='truncate font-mono'
            />
          </div>
          {!props.noLedger && (
            <div>
              <strong className='mr-2'>Ledger:</strong>
              {props.issuerDid?.includes(Ledgers.POLYGON)
                ? props.issuerDid.includes(Network.TESTNET)
                  ? PolygonNetworks.TESTNET
                  : PolygonNetworks.MAINNET
                : props.issuerDid?.split(':')[2]}
            </div>
          )}
        </div>

        <div className='flex items-end justify-between'>
          {props.w3cSchema ? (
            <DataTooltip
              data={props.attributes}
              renderItem={(attribute: IAttributes) => attribute.attributeName}
            >
              <AttributesList
                attributes={props.attributes}
                limitedAttributes={props.limitedAttributes}
              />
            </DataTooltip>
          ) : (
            <AttributesList
              attributes={props.attributes}
              limitedAttributes={props.limitedAttributes}
            />
          )}

          {props.w3cSchema &&
            !props.isVerification &&
            !props.isVerificationUsingEmail && (
              <Button
                onClick={handleButtonClick}
                className='bg-secondary hover:bg-primary h-6 w-auto'
                variant='outline'
              >
                <ShieldCheck className='mr-1 h-4 w-4' />
                Issue
              </Button>
            )}
        </div>

        {props.showCheckbox && !hasNestedAttributes && (
          <CustomCheckbox
            isSelectedSchema={isSelected}
            onChange={handleCheckboxChange}
            showCheckbox={props.showCheckbox}
            schemaData={{
              schemaId: props.schemaId,
              schemaName: props.schemaName,
              attributes: props.attributes
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SchemaCard;
