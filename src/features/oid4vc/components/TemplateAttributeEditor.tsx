'use client'

import { Plus, Trash2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TemplateAttributeForm,
  TemplateNamespaceForm,
  emptyAttribute,
} from '@/features/oid4vc/utils/lifecycle'

import { AttributeValueType } from '@/app/oid4vc/interface/interface'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { JSX } from 'react'
import { Label } from '@/components/ui/label'

const valueTypes: AttributeValueType[] = [
  'string',
  'number',
  'boolean',
  'date',
  'object',
  'array',
  'image',
]

interface AttributeEditorProps {
  attributes: TemplateAttributeForm[]
  onChange: (attributes: TemplateAttributeForm[]) => void
  idPrefix: string
  missingAttributeError?: string
}

export function AttributeEditor({
  attributes,
  onChange,
  idPrefix,
  missingAttributeError,
}: AttributeEditorProps): JSX.Element {
  const update = (index: number, patch: Partial<TemplateAttributeForm>): void =>
    onChange(
      attributes.map((attribute, attributeIndex) => {
        if (attributeIndex === index) {
          return { ...attribute, ...patch }
        }
        return attribute
      }),
    )

  return (
    <div className="space-y-3">
      {attributes.map((attribute, index) => (
        <div
          key={`${idPrefix}-${index}`}
          className="space-y-3 rounded-md border p-3"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`${idPrefix}-${index}-key`}>Attribute key</Label>
              <Input
                id={`${idPrefix}-${index}-key`}
                value={attribute.key}
                placeholder="full_name"
                onChange={(event) => update(index, { key: event.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${idPrefix}-${index}-type`}>Value type</Label>
              <Select
                value={attribute.valueType}
                onValueChange={(value) =>
                  update(index, { valueType: value as AttributeValueType })
                }
              >
                <SelectTrigger id={`${idPrefix}-${index}-type`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {valueTypes.map((valueType) => (
                    <SelectItem key={valueType} value={valueType}>
                      {valueType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${idPrefix}-${index}-display`}>
              Display name (optional)
            </Label>
            <Input
              id={`${idPrefix}-${index}-display`}
              value={attribute.displayName}
              placeholder="Full name"
              onChange={(event) =>
                update(index, { displayName: event.target.value })
              }
            />
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={attribute.mandatory}
                onCheckedChange={(checked) =>
                  update(index, { mandatory: checked === true })
                }
              />
              Mandatory
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={attribute.disclose}
                onCheckedChange={(checked) =>
                  update(index, { disclose: checked === true })
                }
              />
              Selectively disclose
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive ml-auto gap-1.5"
              onClick={() =>
                onChange(
                  attributes.filter(
                    (_, attributeIndex) => attributeIndex !== index,
                  ),
                )
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      ))}

      {missingAttributeError && (
        <p className="text-destructive text-xs">{missingAttributeError}</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => onChange([...attributes, emptyAttribute()])}
      >
        <Plus className="h-3.5 w-3.5" />
        Add attribute
      </Button>
    </div>
  )
}

interface NamespaceEditorProps {
  namespaces: TemplateNamespaceForm[]
  onChange: (namespaces: TemplateNamespaceForm[]) => void
  errors: Record<string, string>
}

export function NamespaceEditor({
  namespaces,
  onChange,
  errors,
}: NamespaceEditorProps): JSX.Element {
  const update = (index: number, patch: Partial<TemplateNamespaceForm>): void =>
    onChange(
      namespaces.map((namespace, namespaceIndex) => {
        if (namespaceIndex === index) {
          return { ...namespace, ...patch }
        }
        return namespace
      }),
    )

  return (
    <div className="space-y-4">
      {namespaces.map((namespace, index) => (
        <div
          key={`namespace-${index}`}
          className="space-y-3 rounded-md border p-4"
        >
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <Label htmlFor={`namespace-${index}-key`}>Namespace</Label>
              <Input
                id={`namespace-${index}-key`}
                value={namespace.namespace}
                placeholder="org.iso.18013.5.1"
                onChange={(event) =>
                  update(index, { namespace: event.target.value })
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive gap-1.5"
              onClick={() =>
                onChange(
                  namespaces.filter(
                    (_, namespaceIndex) => namespaceIndex !== index,
                  ),
                )
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
          {errors[`namespace-${index}`] && (
            <p className="text-destructive text-xs">
              {errors[`namespace-${index}`]}
            </p>
          )}

          <AttributeEditor
            idPrefix={`namespace-${index}-attribute`}
            attributes={namespace.attributes}
            missingAttributeError={errors[`namespace-${index}-attributes`]}
            onChange={(attributes) => update(index, { attributes })}
          />
        </div>
      ))}

      {errors.namespaces && (
        <p className="text-destructive text-xs">{errors.namespaces}</p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() =>
          onChange([
            ...namespaces,
            { namespace: '', attributes: [emptyAttribute()] },
          ])
        }
      >
        <Plus className="h-3.5 w-3.5" />
        Add namespace
      </Button>
    </div>
  )
}
