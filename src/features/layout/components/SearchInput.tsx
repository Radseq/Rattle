import { HistorySearchMenu } from "~/features/search/components/HistorySearchMenu"
import { SearchMenu } from "~/features/search/components/SearchMenu"
import Image from "next/image"
import { useState } from "react"
import { useDebounce } from "~/features/search"
import { useSearchHistory } from "~/features/search/hooks/useSearchHistory"

const debounceTimeout = 200

export const SearchInput = () => {
	const [searchValue, setSearchValue] = useState("")
	const [showSearchMenu, setShowSearchMenu] = useState(false)

	const debouncedValue = useDebounce(searchValue, debounceTimeout)

	const searchHistory = useSearchHistory()

	return (
		<div className="mt-2 flex rounded-xl border bg-gray-200 p-2">
			<Image
				width={10}
				height={10}
				src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/search.svg"
				className="inline w-7"
				alt={"search icon"}
			/>
			<div className="w-full" onMouseLeave={() => setShowSearchMenu(false)}>
				<input
					placeholder="Search Post"
					type="text"
					className="w-full pl-2 text-lg"
					onMouseEnter={() => setShowSearchMenu(true)}
					onChange={(e) => setSearchValue(e.target.value)}
				/>
				<div className="absolute top-10 z-10 flex-col rounded-lg bg-white shadow-[0px_0px_3px_1px_#00000024]">
					{showSearchMenu && !searchValue && (
						<HistorySearchMenu
							searchResult={searchHistory.history}
							onRemove={(toDelete) => searchHistory.remove(toDelete)}
						/>
					)}
					{<SearchMenu searchValue={debouncedValue} />}
				</div>
			</div>
		</div>
	)
}
