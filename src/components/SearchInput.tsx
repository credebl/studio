import { JSX } from 'react'

const SearchInput = ({
  onInputChange,
  value = '',
}: {
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
}): JSX.Element => (
  <div>
    <label htmlFor="topbar-search" className="sr-only">
      Search
    </label>
    <div className="relative lg:w-96">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-500 dark:text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>
      <input
        type="text"
        name="email"
        id="topbar-search"
        onChange={onInputChange}
        value={value}
        className="border-input file:text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-10 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        placeholder="Search"
      />
    </div>
  </div>
)

export default SearchInput
