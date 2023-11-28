import React, { useState } from 'react'

interface IProps {
    value: string
    className: string
}

const CopyDid = ({ value, className }: IProps) => {
    const [copied, setCopied] = useState(false)
    function copyTextVal(e: React.MouseEvent<HTMLButtonElement>) {

        e.preventDefault()

        setCopied(true);

        // Copy the text inside the text field
        navigator.clipboard.writeText(value);

        // Reset copied state after 1 second
        setTimeout(() => {
            setCopied(false);
        }, 2000);

    }
    return (
        <>
            <span className={className}>
                {value}
            </span>
            <button
                className="shrink-0"
                onClick={e => !copied && copyTextVal(e)}
            >
                {copied
                    ? <svg className="h-6 w-6 text-white ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" strokeWidth={2} stroke="green" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
                    : <svg className="h-6 w-6 text-black dark:text-white ml-3 text-base" width="25" height="25" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
                }
            </button>
        </>
    )
}

export default CopyDid