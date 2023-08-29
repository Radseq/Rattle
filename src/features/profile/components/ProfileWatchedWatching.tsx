import { type FC } from "react"

export const ProfileWatchedWatching: FC<{
	watchedWatchingCount: { watchedCount: number; watchingCount: number }
}> = ({ watchedWatchingCount }) => {
	return (
		<footer className="ml-2 mt-2 flex gap-10">
			<span className="flex">
				<span className="">{watchedWatchingCount.watchedCount}</span>
				<span className="ml-1 text-slate-500">Watched</span>
			</span>
			<span className="flex">
				<span className="">{watchedWatchingCount.watchingCount}</span>
				<span className="pl-1 text-slate-500">Followed</span>
			</span>
		</footer>
	)
}
