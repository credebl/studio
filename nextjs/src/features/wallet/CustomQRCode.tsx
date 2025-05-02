import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import domtoimage from 'dom-to-image';
import { Button } from "@/components/ui/button";
import { Check, Copy, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

const CustomQRCode = ({ value, size }: { value: string, size: number }) => {
  const node = document.createTextNode('');
  const inputRef = useRef<Node>(node);
  const [isCopied, setIsCopied] = useState(false);

  const copyTextVal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadQRCode = () => {
    if (inputRef.current) {
      domtoimage.toJpeg(inputRef.current, { quality: 0.95 })
        .then(function (dataUrl) {
          const link = document.createElement('a');
          link.download = 'qr-code.jpeg';
          link.href = dataUrl;
          link.click();
        });
    }
  };

  return (
    <div className="h-auto max-w-64 w-full flex flex-col items-center gap-2">
      <Card ref={inputRef} className="p-4 flex flex-col items-center">
        <QRCode
          size={1.5 * size}
          value={value}
          className="w-full h-auto"
        />
        <p className="text-center text-sm mt-4 text-muted-foreground">
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
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? "Copied!" : "Copy invitation URL"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default CustomQRCode;