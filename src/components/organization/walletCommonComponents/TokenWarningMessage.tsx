const TokenWarningMessage = () => (
    <span className="inline-flex items-center bg-amber-200 mt-2 text-amber-800 text-xs font-medium mr-2 px-2 py-2 rounded-sm dark:bg-amber-200 dark:text-amber-800">
        <svg
            width="20"
            height="17"
            viewBox="0 0 22 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-amber-800 mr-1.5 my-2 mr-2"
        >
            <path
                d="M0 19L11 0L22 19H0ZM3.45 17H18.55L11 4L3.45 17ZM11 16C11.2833 16 11.5208 15.9042 11.7125 15.7125C11.9042 15.5208 12 15.2833 12 15C12 14.7167 11.9042 14.4792 11.7125 14.2875C11.5208 14.0958 11.2833 14 11 14C10.7167 14 10.4792 14.0958 10.2875 14.2875C10.0958 14.4792 10 14.7167 10 15C10 15.2833 10.0958 15.5208 10.2875 15.7125C10.4792 15.9042 10.7167 16 11 16ZM10 13H12V8H10V13Z"
                fill="currentColor"
            />
        </svg>
        Before creating the wallet, ensure that you have added
        tokens to the above address
    </span>
)
export default TokenWarningMessage;