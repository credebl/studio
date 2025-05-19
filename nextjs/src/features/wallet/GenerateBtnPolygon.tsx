import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import React from 'react'

interface IProps {
  generatePolygonKeyValuePair: () => void
  loading: boolean
}

const GenerateButtonPolygon = ({
  generatePolygonKeyValuePair,
}: IProps): React.JSX.Element => (
  <div className="relative my-3 grid w-fit grid-cols-2 gap-x-9 md:gap-56">
    <div className="mt-4">
      <Label htmlFor="generateKey">Generate private key</Label>
      <span className="text-destructive text-xs">*</span>
    </div>

    <Button
      id="generateKey"
      type="button"
      className=""
      onClick={generatePolygonKeyValuePair}
    >
      Generate
    </Button>
  </div>
)

export default GenerateButtonPolygon
