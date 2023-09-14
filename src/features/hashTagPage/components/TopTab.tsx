import Link from "next/link"
import { type FC } from "react"

export const TopTab: FC<{}> = () => {
	return (
		<>
			<article>
				<h1 className="text-2xl font-bold">People</h1>
				<ul>
					<li></li>
				</ul>
				<Link className="font-medium text-blue-600" href={""}>
					View all
				</Link>
			</article>
			<article></article>
		</>
	)
}
