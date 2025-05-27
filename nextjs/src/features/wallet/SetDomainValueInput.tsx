import React, { type ChangeEvent } from 'react'
import { Field } from 'formik'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface IProps {
  setDomainValue: (val: string) => void
  domainValue: string
  formikHandlers: {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void
    errors: {
      domain?: string
    }
    touched: {
      domain?: boolean
    }
  }
}

const SetDomainValueInput = ({
  setDomainValue,
  domainValue,
  formikHandlers,
}: IProps): React.JSX.Element => (
  <div className="relative mb-3">
    <div className="flex">
      <Label htmlFor="webdomain">Enter Domain</Label>
      <span className="text-destructive text-xs">*</span>
    </div>
    <Field
      as={Input}
      id="webdomain"
      name="domain"
      className={cn('block h-11 w-full truncate rounded-lg p-2.5 text-sm', '')}
      value={domainValue}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setDomainValue(e.target.value)
        formikHandlers.handleChange(e)
      }}
      onBlur={formikHandlers.handleBlur}
      placeholder="Please enter domain"
    />
    {formikHandlers.errors?.domain && formikHandlers.touched?.domain && (
      <span className="text-destructive static bottom-0 text-xs">
        {formikHandlers.errors?.domain}
      </span>
    )}
  </div>
)

export default SetDomainValueInput
