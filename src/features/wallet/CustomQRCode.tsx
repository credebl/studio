import { Check, Copy, Download } from 'lucide-react'
import React, { useRef, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import QRCode from 'react-qr-code'
import domtoimage from 'dom-to-image'

const CustomQRCode = ({
  value,
  size,
}: {
  value: string
  size: number
}): React.JSX.Element => {
  const inputRef = useRef<HTMLDivElement>(null)
  const [isCopied, setIsCopied] = useState(false)

  const copyTextVal = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    setIsCopied(true)
    navigator.clipboard.writeText(value)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const downloadQRCode = (): void => {
    if (inputRef.current) {
      domtoimage
        .toJpeg(inputRef.current, { quality: 0.95 })
        .then(function (dataUrl) {
          const link = document.createElement('a')
          link.download = 'qr-code.jpeg'
          link.href = dataUrl
          link.click()
        })
    }
  }

  return (
    <div className="flex h-auto w-full max-w-64 flex-col items-center gap-2">
      <Card ref={inputRef} className="flex flex-col items-center p-4">
        <QRCode size={1.5 * size} value={value} className="h-auto w-full" />
        <p className="text-muted-foreground mt-4 text-center text-sm">
          SCAN TO CONNECT
        </p>
      </Card>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={downloadQRCode}
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Download QR Code</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyTextVal}
            >
              {isCopied ? (
                <Check className="text-success h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? 'Copied!' : 'Copy invitation URL'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default CustomQRCode
