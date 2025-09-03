'use client'

import { Card, CardContent } from '@/components/ui/card'
import { DataType, Ledgers, Network, PolygonNetworks } from '@/common/enums'
import {
  IAttributes,
  ISchemaCardProps,
  ISchemaData,
} from '../type/schemas-interface'
import React, { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePathname, useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import CustomCheckbox from '@/components/CustomCheckbox'
import DateTooltip from '@/components/DateTooltip'
import Loader from '@/components/Loader'
import { ShieldCheck } from 'lucide-react'
import { dateConversion } from '@/utils/DateConversion'
import { limitedAttributesLength } from '@/config/CommonConstant'
import { pathRoutes } from '@/config/pathRoutes'
import { setSchemaDetails } from '@/lib/schemaStorageSlice'
import { useAppDispatch } from '@/lib/hooks'

const AttributesList: React.FC<{
  readonly attributes: IAttributes[]
  readonly limitedAttributes?: boolean
}> = ({ attributes, limitedAttributes }) => {
  const isLimited =
    limitedAttributes !== false &&
    Array.isArray(attributes) &&
    attributes.length > limitedAttributesLength

  const displayedAttributes = isLimited
    ? attributes.slice(0, limitedAttributesLength)
    : (attributes ?? [])

  return (
    <div className="text-foreground flex flex-wrap items-center text-base font-semibold">
      <span className="mr-2">Attributes:</span>
      {displayedAttributes.map((element) => (
        <span
          key={element.attributeName}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors"
        >
          {element.attributeName}
        </span>
      ))}
      {isLimited && <span className="text-muted-foreground ml-2">...</span>}
    </div>
  )
}

const SchemaCard = (props: Readonly<ISchemaCardProps>): React.JSX.Element => {
  const [isSelected, setIsSelected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const isVerificationPage = pathname.includes('verification')
  const dispatch = useAppDispatch()

  let ledgerDisplay: string | undefined = undefined
  if (props.issuerDid?.includes(Ledgers.POLYGON)) {
    ledgerDisplay = props.issuerDid.includes(Network.TESTNET)
      ? PolygonNetworks.TESTNET
      : PolygonNetworks.MAINNET
  } else if (props?.issuerDid) {
    const [, , ledger] = props.issuerDid.split(':')
    ledgerDisplay = ledger
  }

  const handleButtonClick = (): void => {
    props.onClickW3cIssue?.(
      props.schemaId,
      props.schemaName,
      props.version,
      props.issuerDid,
      props.attributes,
      props.created,
    )
    dispatch(
      setSchemaDetails({
        type: 'W3C_SCHEMA',
        w3cSchema: {
          schemaVersion: props.version,
          value: JSON.stringify(props.attributes),
          label: `${props.schemaName}-${props.version}`,
          schemaId: props.schemaId,
          schemaName: props.schemaName,
          schemaIdentifier: props.schemaId,
          attributes: props.attributes,
          type: 'W3C_SCHEMA',
          credentialId: '',
        },
      }),
    )
    router.push(pathRoutes.organizations.Issuance.issue)
  }

  const handleCheckboxChange = (
    checked: boolean,
    schemaData?: ISchemaData,
  ): void => {
    setIsSelected(checked)
    props.onChange?.(checked, schemaData ? [schemaData] : [])
  }

  const SchemaData = {
    schemaId: props.schemaId,
    attributes: props.attributes,
    issuerDid: props.issuerDid,
    created: props.created,
  }

  const W3CSchemaData = {
    schemaId: props.schemaId,
    schemaName: props.schemaName,
    version: props.version,
    issuerDid: props.issuerDid,
    attributes: props.attributes,
    created: props.created,
  }

  const hasNestedAttributes = props.attributes?.some(
    (attr: IAttributes) => attr.schemaDataType === DataType.ARRAY,
  )

  const handleCardClick = (): void => {
    if (isVerificationPage) {
      return
    }

    if (!props.w3cSchema && !hasNestedAttributes && props.schemaId) {
      router.push(`/schemas/${props.schemaId}?alias=${props.schemaName}`)
    }

    if (props.onClickCallback) {
      props.onClickCallback(SchemaData)
    }
    if (props.w3cSchema && props.onClickW3CCallback) {
      props.onClickW3CCallback(W3CSchemaData)
    }
  }

  return (
    <Card
      className={`relative h-full w-full overflow-hidden rounded-xl shadow-xl transition-transform duration-300 ${
        props.w3cSchema || props.isClickable === false || isVerificationPage
          ? 'cursor-default'
          : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'
      } ${hasNestedAttributes ? 'pointer-events-none opacity-80' : ''}`}
      onClick={handleCardClick}
    >
      {hasNestedAttributes && (
        <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
          <div className="bg-secondary text-secondary-foreground rounded-md p-4 text-center text-sm shadow-lg">
            This schema can only be used through the API as it contains nested
            objects.
          </div>
        </div>
      )}

      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="w-full sm:max-w-[60%]">
            <h3 className="text-foreground text-xl font-bold break-words">
              {props.schemaName}
            </h3>
            <p className="text-muted-foreground text-sm">
              Version: {props.version}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm sm:justify-end sm:text-right">
            {props.w3cSchema && (
              <span className="focus:ring-ring text-foreground flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none">
                W3C
              </span>
            )}
            <DateTooltip date={props.created}>
              <span className="text-muted-foreground">
                Created: {dateConversion(props.created)}
              </span>
            </DateTooltip>
          </div>
        </div>

        <div className="min-w-0 space-y-1 text-sm">
          <button
            className="url-link flex items-start sm:items-center"
            onClick={props.onTitleClick}
          >
            <strong className="mr-2 shrink-0">Schema ID:</strong>
            <div className="!url-link min-w-0 font-mono text-sm">
              {props.schemaId || ''}
            </div>
          </button>

          <div className="flex items-start sm:items-center">
            <strong className="mr-2 shrink-0">Issuer:</strong>
            <div className="min-w-0 truncate">{props.issuerName || ''}</div>
          </div>

          {!props.noLedger && (
            <div className="flex items-center">
              <strong className="mr-2 shrink-0">Ledger:</strong>
              <span className="text-foreground truncate text-sm">
                {ledgerDisplay}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <AttributesList
                    attributes={props.attributes}
                    limitedAttributes={props.limitedAttributes}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={4}
                className="break-words whitespace-normal"
              >
                <pre className="block font-semibold break-words whitespace-normal">
                  {props.attributes
                    .map((val: { attributeName: string }) => val.attributeName)
                    .join(', ')}
                </pre>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {props.w3cSchema &&
            !props.isVerification &&
            !props.isVerificationUsingEmail && (
              <Button
                onClick={() => {
                  setIsLoading(true)
                  handleButtonClick()
                }}
                className="h-8 w-full sm:w-auto"
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={16} />
                ) : (
                  <>
                    <ShieldCheck className="mr-1 h-4 w-4" />
                    Issue
                  </>
                )}
              </Button>
            )}
        </div>

        {props.showCheckbox && !hasNestedAttributes && (
          <CustomCheckbox
            isSelectedSchema={Boolean(isSelected)}
            onChange={handleCheckboxChange}
            showCheckbox={props.showCheckbox}
            schemaData={{
              schemaId: props.schemaId,
              schemaName: props.schemaName,
              attributes: props.attributes,
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export default SchemaCard
