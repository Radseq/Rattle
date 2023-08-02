import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"
import { useState } from "react"
import { useDebounce } from "~/features/search"
import { SearchMenu } from "~/features/search/components/SearchMenu"
import { HistorySearchMenu } from "~/features/search/components/HistorySearchMenu"
import { useSearchHistory } from "~/features/search/hooks/useSearchHistory"

const debounceTimeout = 200

export const NavigationBar = () => {
	const { isSignedIn } = useUser()

	const [searchValue, setSearchValue] = useState("")
	const [showSearchMenu, setShowSearchMenu] = useState(false)

	const debouncedValue = useDebounce(searchValue, debounceTimeout)

	const searchHistory = useSearchHistory()

	return (
		<ul className="flex content-center justify-between overflow-hidden">
			<li className="rounded py-2 hover:bg-indigo-300">
				<Link className="truncate" href={isSignedIn ? "/home" : "/"}>
					<Image
						width={10}
						height={10}
						src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/home.svg"
						className="mx-4 inline w-7 sm:mx-2"
						alt={"home icon"}
					/>
					<span className="hidden pr-3 sm:inline">Home</span>
				</Link>
			</li>
			<li className="flex w-3/5 rounded py-2 hover:bg-indigo-300">
				<Image
					width={10}
					height={10}
					src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/search.svg"
					className="mx-4 inline w-7 sm:mx-2"
					alt={"search icon"}
				/>
				<div onMouseLeave={() => setShowSearchMenu(false)}>
					<input
						placeholder="Search Post"
						type="text"
						className="mr-3 w-full"
						onMouseEnter={() => setShowSearchMenu(true)}
						onChange={(e) => setSearchValue(e.target.value)}
					/>
					<div className="absolute top-8 z-10  flex-col rounded-lg bg-white shadow-[0px_0px_3px_1px_#00000024]">
						{showSearchMenu && !searchValue && (
							<HistorySearchMenu
								searchResult={searchHistory.history}
								onRemove={(toDelete) => searchHistory.remove(toDelete)}
							/>
						)}
						{showSearchMenu && searchValue && (
							<SearchMenu searchValue={debouncedValue} />
						)}
					</div>
				</div>
			</li>
			<li className="rounded py-2 hover:bg-indigo-300">
				<Link className="truncate" href="#">
					<Image
						width={10}
						height={10}
						src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/cog.svg"
						className="mx-4 inline w-7 sm:mx-2"
						alt={"cog icon"}
					/>
					<span className="hidden pr-3 sm:inline">Settings</span>
				</Link>
			</li>
		</ul>
	)
}
