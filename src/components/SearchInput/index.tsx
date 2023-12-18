import { ChangeEvent, useEffect, useState } from "react"

interface IProps {
	onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const SearchInput = ({ onInputChange }: IProps) => {
	const initSearch = {
		target: {
			value: ""
		}
	}
	const waitingTime = 1000 // 1 second
	const [search, setSearch] = useState(initSearch)
	const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
		setSearch(e)
	}

	useEffect(() => {
		let getData: NodeJS.Timeout;

		getData = setTimeout(() => onInputChange(search), waitingTime);

		return () => clearTimeout(getData);
	}, [search])

	return (
		<div>
			<label className="sr-only">Search</label>
			<div className="relative lg:w-96">
				<div
					className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
				>
					<svg
						className="w-5 h-5 text-gray-500 dark:text-gray-400"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					><path
						fillRule="evenodd"
						d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
						clipRule="evenodd"></path>
					</svg>
				</div>
				<input
					type="text"
					name="topbar-search"
					id="topbar-search"
					value={search?.target?.value}
					onChange={(e: ChangeEvent<HTMLInputElement>) => changeHandler(e)}
					className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full px-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
					placeholder="Search"
				/>
				<button className="absolute inset-y-0 right-0 flex items-center pr-3" onClick={() => setSearch(initSearch)}>
					<svg className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-white z-10 hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
		</div>
	);

}

export default SearchInput