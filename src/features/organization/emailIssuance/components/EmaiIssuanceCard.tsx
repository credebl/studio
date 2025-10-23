import React, { JSX } from 'react'

import { Card } from '@/components/ui/card'
import { IAttributes } from '../type/EmailIssuance'
import { IEmailIssuanceCardProps } from '../../connectionIssuance/type/Issuance'
import { SchemaTypes } from '@/common/enums'
import { SearchableSelect } from '@/components/SearchableSelect'

function EmailIssuanceCard({
  schemaType,
  // allSchema,
  // handleFilterChange,
  // optionsWithDefault,
  credentialOptions,
  selectValue,
  clear,
  handleSelect,
  handleSearchChange,
  mounted,
  credentialSelected,
  attributes,
  isAllSchemaFlagSelected,
}: IEmailIssuanceCardProps): JSX.Element {
  return (
    <Card className="p-5 py-8">
      <div className="md:min-h-[10rem]">
        <div className="grid w-[980px] grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex flex-col justify-between">
            <div className="pb-6 text-xl font-semibold dark:text-white">
              {schemaType === SchemaTypes.schema_W3C
                ? 'Select Schema '
                : 'Select Credential Definition'}
            </div>
            <div className="text-primary-900 flex gap-4">
              {/* Temporarily commented will be worked on later */}
              {/* {schemaType === SchemaTypes.schema_W3C && (
                <SchemaSelect
                  {...{ allSchema, handleFilterChange, optionsWithDefault }}
                />
              )} */}
              <div>
                {mounted && (
                  <SearchableSelect
                    className="border-muted max-w-lg border-1"
                    options={
                      Array.isArray(credentialOptions) ? credentialOptions : []
                    }
                    value={selectValue}
                    clear={clear}
                    onValueChange={handleSelect}
                    onSearchChange={handleSearchChange}
                    enableInternalSearch={
                      !(
                        schemaType === SchemaTypes.schema_W3C &&
                        isAllSchemaFlagSelected
                      )
                    }
                    placeholder={
                      schemaType === SchemaTypes.schema_W3C
                        ? 'Select Schema '
                        : 'Select Credential Definition'
                    }
                  />
                )}
              </div>
            </div>

            <div className="mt-4">
              {credentialSelected && (
                <Card className="max-w-[30rem] p-5">
                  <div>
                    <p className="pb-2 text-black dark:text-white">
                      <span className="font-semibold">Schema: </span>
                      {credentialSelected?.schemaName || ''}{' '}
                      <span>[{credentialSelected?.schemaVersion}]</span>
                    </p>
                    {schemaType === SchemaTypes.schema_INDY && (
                      <p className="pb-2 text-black dark:text-white">
                        {' '}
                        <span className="font-semibold">
                          Credential Definition:
                        </span>{' '}
                        {credentialSelected?.credentialDefinition}
                      </p>
                    )}
                    <span className="font-semibold text-black dark:text-white">
                      Attributes:
                    </span>

                    <div className="flex flex-wrap overflow-hidden">
                      {attributes?.slice(0, 3).map((element: IAttributes) => (
                        <div key={element.attributeName} className="truncate">
                          <span className="bg-secondary text-secondary-foreground hover:bg-secondary/80 m-1 mr-2 rounded px-2.5 py-0.5 text-sm font-medium shadow-sm transition-colors">
                            {element.attributeName}
                          </span>
                        </div>
                      ))}
                      {attributes?.length > 3 && (
                        <span className="text-muted-foreground ml-2 text-sm/6">
                          +{attributes.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default EmailIssuanceCard
