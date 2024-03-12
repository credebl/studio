import React from "react"
import { Button, Checkbox, Label } from 'flowbite-react';

interface IProps {
    generatePolygonKeyValuePair:()=>void
}

const GenerateButtonPolygon = ({generatePolygonKeyValuePair}:IProps) =>(
     
        <div className="my-3 relative flex justify-between">
            <div className="mt-4">
                <Label value="Generate private key" />
                <span className="text-red-500 text-xs">*</span>
            </div>

            <Button
                type="button"
                className="h-min p-0 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-white bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                onClick={() => generatePolygonKeyValuePair()}
            >
                Generate
            </Button>
        </div>
   
)
export default GenerateButtonPolygon;