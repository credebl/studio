import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import domtoimage from 'dom-to-image';
import { Button } from "flowbite-react";

const CustomQRCode = ({ value, size }: { value: string, size: number }) => {

	const inputRef = useRef<HTMLInputElement>(null);
	const [isCopied, setIsCopied] = useState(false);

	function copyTextVal(e: React.MouseEvent<HTMLButtonElement>) {

		e.preventDefault()

		setIsCopied(true);

		// Copy the text inside the text field
		navigator.clipboard.writeText(value);

		// Reset copied state after 1 second
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);

	}

	const drawHtmlToCanvas = () => {
		domtoimage.toJpeg(inputRef.current, { quality: 0.95 })
			.then(function (dataUrl) {
				var link = document.createElement('a');
				link.download = 'my-image-name.jpeg';
				link.href = dataUrl;
				link.click();
			});
	};


	return (<div className="h-auto max-w-64 w-full flex flex-col items-center">
		<div
			ref={inputRef}
			className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 overflow-hidden">

			<QRCode
				size={1.5*size}
				value={value}
			/>
			<p className="text-center text-base mt-4">SCAN TO CONNECT</p>

		</div>
		{/* <p className="text-center mt-3">OR</p> */}
		{/* <p className="text-center mt-3 ">Invitation URL</p> */}
		<div className="flex items-center text-center mt-3 dark:text-white">
			<p className="md center"></p>  
			<button
			onClick={drawHtmlToCanvas}
			
			><svg 
				className='pr-2' 
				stroke-width="2" stroke="currentColor"
				xmlns="http://www.w3.org/2000/svg" 
				width="25" height="25" fill="none" viewBox="0 0 24 23">
				<path fill="#fff" d="M23.312 10.844a.685.685 0 0 0-.687.688v6.254a3.086 3.086 0 0 1-3.082 3.082H4.457a3.086 3.086 0 0 1-3.082-3.082V11.43a.685.685 0 0 0-.687-.688.685.685 0 0 0-.688.688v6.356a4.462 4.462 0 0 0 4.457 4.457h15.086A4.462 4.462 0 0 0 24 17.786v-6.254a.688.688 0 0 0-.688-.688Z" />
				<path fill="#fff" d="M11.515 16.783c.133.132.31.203.484.203a.671.671 0 0 0 .484-.203l4.37-4.37a.686.686 0 0 0 0-.973.686.686 0 0 0-.973 0l-3.193 3.198V.688A.685.685 0 0 0 11.999 0a.685.685 0 0 0-.688.688v13.95L8.113 11.44a.686.686 0 0 0-.973 0 .686.686 0 0 0 0 .973l4.375 4.37Z" />
			</svg>
			</button>
			
			<button
				className=
				{`${isCopied }`} onClick={copyTextVal}>
				{isCopied
					? <svg className="h-6 w-6 text-white ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="green" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
					: <svg className="h-6 w-6 text-green ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
				}
				
			</button>
			
		</div>
		
	</div>)

}


export default CustomQRCode;


