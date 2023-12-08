interface IProps {
    icon: string
    backgroundColor: string
    label: string
    value: number
    onClickHandler?: () => void
    classes?: string
}

const DashboardCard = ({ icon, backgroundColor, label, value, onClickHandler, classes }: IProps) => {
    return (
        <button
            type="button"
            className={`items-center justify-between p-4 border-0 border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800 transform transition duration-500 hover:scale-103 hover:bg-gray-50 cursor-pointer bg-no-repeat bg-center bg-cover min-h-[152px] bg-right-bottom bg-transparent overflow-hidden ${classes}`}
            style={{ backgroundImage: backgroundColor }}
            onClick={() => {
                if (onClickHandler)
                    onClickHandler()
            }}
        >
            <div className='absolute bottom-0 -right-4 -z-10'>
                <img className="w-[150px] h-[125px]" src={icon} alt="icon" />
            </div>
            <div className="w-full text-start">
                <h3 className="text-base font-medium text-white">
                    {label}
                </h3>
                <span className="text-2xl font-semi-bold leading-none text-white sm:text-3xl dark:text-white">
                    {value}
                </span>
            </div>
        </button>
    )
}

export default DashboardCard