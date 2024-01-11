import { type FC } from "react"

export const SearchForm: FC<{
	onSearchClick: () => void
	onChangeSearchInput: (input: string) => void
}> = ({ onSearchClick, onChangeSearchInput }) => {
	return (
		<form className="flex items-center">
			<label className="sr-only">Search</label>
			<div className="relative w-full">
				<div className="start-0 pointer-events-none absolute inset-y-0 flex items-center p-2">
					<svg
						className="h-4 w-4 text-gray-500 dark:text-gray-400"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 20 20"
					>
						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
						/>
					</svg>
				</div>
				<input
					type="text"
					onChange={(e) => onChangeSearchInput(e.target.value)}
					className=" block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-7 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  "
					placeholder="Search..."
					required
				/>
			</div>
			<button
				type="submit"
				onClick={onSearchClick}
				className="ms-2 rounded-lg border border-blue-700 bg-blue-700 p-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 "
			>
				<svg
					className="h-4 w-4"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 20 20"
				>
					<path
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
					/>
				</svg>
				<span className="sr-only">Search</span>
			</button>
		</form>
	)
}
