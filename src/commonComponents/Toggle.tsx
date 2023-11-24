interface IProps {
    id: string
    label: string
    checked: boolean
    name: string
    onChangeHandle: (e) => void
}

const Toggle = ({ id, label, checked, name, onChangeHandle }: IProps) => {
    return (
        <label htmlFor={id} className="relative inline-flex items-center cursor-pointer h-fit">
            <input type="checkbox" id={id} name={name} checked={checked} className="sr-only peer" onChange={(e) => onChangeHandle(e)} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-700" />
            {label && <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>}
        </label>
    )
}

export default Toggle