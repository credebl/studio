import React from "react"
import {Label } from 'flowbite-react';
import { Field} from 'formik';


interface IProps {
    setDomainValue:(val:string)=>void
    domainValue:string
}

const SetDomainValueInput = ({ setDomainValue, domainValue }: IProps) => (
    <>
        <div className="my-3 relative">
            <div className="mt-4">
                <Label value="Enter Domain" />
                <span className="text-red-500 text-xs">*</span>
            </div>
        </div>
        <Field
            id="webdomain"
            name="password"
            className="truncate bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 h-11"
            value={domainValue}
            onChange={(e) => setDomainValue(e.target.value)}
            placeholder="Please enter domain"
        />
    </>
)
export default SetDomainValueInput;