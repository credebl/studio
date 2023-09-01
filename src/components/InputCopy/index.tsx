import { ChangeEventHandler, MouseEvent, MouseEventHandler, useRef, useState } from 'react';

interface InputProps {
    field: {
        name: string;
        value: string;
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
        onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    };
}


const InputCopy = ({ field, ...props }: InputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isCopied, setIsCopied] = useState(false);

    function copyTextVal(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        const copyText = inputRef?.current;

        const copiedText: string = copyText?.value as string
        setIsCopied(true);

        // Copy the text inside the text field
        navigator.clipboard.writeText(copiedText);

        // Reset copied state after 1 second
        setTimeout(() => {
            setIsCopied(false);
        }, 1500);

    }

    return (
        <div className="flex items-center">
            <input
                ref={inputRef}
                className="w-full border rounded py-2 px-3 mr-2"
                {...field}
                {...props} />

            <p
                className="text-base font-semibold text-gray-900 truncate dark:text-white"
            >
                <button
                    className=
                    {`${isCopied}`} onClick={copyTextVal}>
                    {isCopied
                        ? <svg className="h-6 w-6 text-white ml-2 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="green" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M5 12l5 5l10 -10" /></svg>
                        : <svg className="h-6 w-6 text-green ml-2 text-base" width="25" height="25" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect x="8" y="8" width="12" height="12" rx="2" />  <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" /></svg>
                    }

                </button>
            </p>
        </div>
    );
};

export default InputCopy;
