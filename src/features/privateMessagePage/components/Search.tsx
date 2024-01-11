import { type FC, useState } from "react"
import { useDebounce } from "~/features/search"
import { SearchForm } from "./SearchForm"

const debounceTimeout = 200

export const Search: FC<{}> = () => {
	const [searchValue, setSearchValue] = useState("")

	const debouncedValue = useDebounce(searchValue, debounceTimeout)

	return (
		<SearchForm
			onSearchClick={() => {}}
			onChangeSearchInput={(message) => setSearchValue(message)}
		/>
	)
}
