import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Field } from "formik";
import React, { type ChangeEvent } from "react";

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
  formikHandlers,
}: IProps) => (
  <div className="mb-3 relative">
    <div>
      <Label htmlFor="webdomain">Enter Domain</Label>
      <span className="text-desctructive text-xs">*</span>
    </div>
    <Field
      as={Input}
      id="webdomain"
      name="domain"
      className={cn(
        "truncate text-sm rounded-lg block w-full p-2.5 h-11",
        ""
      )}
      value={domainValue}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        setDomainValue(e.target.value);
        formikHandlers.handleChange(e);
      }}
      onBlur={formikHandlers.handleBlur}
      placeholder="Please enter domain"
    />
    {formikHandlers.errors?.domain && formikHandlers.touched?.domain && (
      <span className="static bottom-0 text-destructive text-xs">
        {formikHandlers.errors?.domain}
      </span>
    )}
  </div>
);

export default SetDomainValueInput;