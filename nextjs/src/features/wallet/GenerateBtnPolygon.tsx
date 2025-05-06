import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface IProps {
  generatePolygonKeyValuePair: () => void;
  loading: boolean;
}

const GenerateButtonPolygon = ({ generatePolygonKeyValuePair, loading }: IProps) => (
  <div className="my-3 relative grid grid-cols-2 gap-x-9 md:gap-56 w-fit">
    <div className="mt-4">
      <Label htmlFor="generateKey">Generate private key</Label>
      <span className="text-red-500 text-xs">*</span>
    </div>

    <Button
      id="generateKey"
      type="button"
      isLoading={loading}
      className="h-min p-0 focus:z-10 focus:outline-none border border-transparent enabled:hover:bg-cyan-800 dark:enabled:hover:bg-cyan-700 mt-4 text-base font-medium text-center text-black bg-primary-700 rounded-md hover:!bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-700 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
      onClick={generatePolygonKeyValuePair}
    >
      Generate
    </Button>
  </div>
);

export default GenerateButtonPolygon;