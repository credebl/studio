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
      <span className="text-destructive text-xs">*</span>
    </div>

    <Button
      id="generateKey"
      type="button"
      isLoading={loading}
      className=""
      onClick={generatePolygonKeyValuePair}
    >
      Generate
    </Button>
  </div>
);

export default GenerateButtonPolygon;