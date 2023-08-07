import { useRef, useState } from "react";
import download from "downloadjs";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

const CustomQRCode = ({ value, size }: { value: string, size: number }) => {
    
    const inputRef = useRef<HTMLInputElement>(null);
    const [isCopied, setIsCopied] = useState(false);
    function copyTextVal(e: React.MouseEvent<HTMLButtonElement>) {

        e.preventDefault()
        const copyText = inputRef?.current;

        setIsCopied(true);

        // Copy the text inside the text field
        navigator.clipboard.writeText(value);

        // Reset copied state after 1 second
        setTimeout(() => {
            setIsCopied(false);
        }, 2000);

    }


    const contentRef = useRef<HTMLDivElement>(null);

    const handleDownload = async () => {
        if (contentRef.current) {
          const canvas = await html2canvas(contentRef.current);
          const dataURL = canvas.toDataURL();
          download(dataURL, "downloaded_image.png", "image/png");
        }
      };
    
    return (<div className="h-auto max-w-64 w-full flex flex-col items-center">
        <div 
        ref={contentRef}
        className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 overflow-hidden">

            <QRCode
                size={size}
                value={value}
            />
            <p className="text-center text-base mt-4">SCAN TO CONNECT</p>

        </div>
        <p className="text-center mt-3">OR</p>
        <p className="text-center mt-3 ">Invitation URL</p>
        <div className="flex items-center text-center mt-1">
            <p className="md: w-[240px] break-all truncate">{value}</p>
            <button
                className=
                {`${isCopied ? 'text-green-600' : ''}`} onClick={copyTextVal}>
                {isCopied
                    ? <svg className="h-6 w-6 text-white ml-3 text-base" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="green" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
                    : <svg className="h-6 w-6 text-green ml-3 text-base" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
                }
            </button>

        </div>
        <button
        onClick={handleDownload}
        className="text-sm content-center px-5 py-2.5 mt-6 text-base font-medium text-center text-white bg-primary-700 rounded-lg hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
        >
            Download
        </button>

    </div>)

};

export default CustomQRCode;
