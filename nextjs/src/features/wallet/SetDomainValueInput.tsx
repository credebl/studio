import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Field } from 'formik';
import React, { type ChangeEvent } from 'react';

interface IProps {
  setDomainValue: (val: string) => void;
  domainValue: string;
  formikHandlers: {
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    errors: {
      domain?: string;
    };
    touched: {
      domain?: boolean;
    };
  };
}

const SetDomainValueInput = ({
  setDomainValue,
  domainValue,
  formikHandlers
}: IProps) => (
  <div className='relative mb-3'>
    <div>
      <Label htmlFor='webdomain'>Enter Domain</Label>
      <span className='text-desctructive text-xs'>*</span>
    </div>
    <Field
      as={Input}
      id='webdomain'
      name='domain'
      className={cn('block h-11 w-full truncate rounded-lg p-2.5 text-sm', '')}
      value={domainValue}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setDomainValue(e.target.value);
        formikHandlers.handleChange(e);
      }}
      onBlur={formikHandlers.handleBlur}
      placeholder='Please enter domain'
    />
    {formikHandlers.errors?.domain && formikHandlers.touched?.domain && (
      <span className='text-destructive static bottom-0 text-xs'>
        {formikHandlers.errors?.domain}
      </span>
    )}
  </div>
);

export default SetDomainValueInput;
